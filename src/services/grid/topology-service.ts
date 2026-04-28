import { GridTopology, GridNode, GridEdge } from '../types/grid-topology';

/**
 * Service for fetching and managing grid topology data
 * Simulates grid topology from API with 60-second refresh
 */
export class GridTopologyService {
  private static instance: GridTopologyService;
  private refreshInterval: NodeJS.Timeout | null = null;
  private currentTopology: GridTopology | null = null;
  private listeners: Set<(topology: GridTopology) => void> = new Set();

  private constructor() {}

  static getInstance(): GridTopologyService {
    if (!GridTopologyService.instance) {
      GridTopologyService.instance = new GridTopologyService();
    }
    return GridTopologyService.instance;
  }

  /**
   * Subscribe to topology updates
   */
  subscribe(callback: (topology: GridTopology) => void): () => void {
    this.listeners.add(callback);
    // Immediately send current data if available
    if (this.currentTopology) {
      callback(this.currentTopology);
    }
    return () => this.listeners.delete(callback);
  }

  /**
   * Start automatic refresh every 60 seconds
   */
  startAutoRefresh(): void {
    if (this.refreshInterval) return;
    
    this.refreshInterval = setInterval(() => {
      this.fetchTopology().catch(console.error);
    }, 60000);
  }

  /**
   * Stop automatic refresh
   */
  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Fetch latest grid topology from API
   */
  async fetchTopology(): Promise<GridTopology> {
    try {
      // In real implementation, this would call the grid API
      // const response = await fetch('/api/grid/topology');
      // return await response.json();
      
      const mockTopology = this.generateMockTopology();
      this.currentTopology = mockTopology;
      
      // Notify all listeners
      this.listeners.forEach(listener => listener(mockTopology));
      
      return mockTopology;
    } catch (error) {
      console.error('Failed to fetch grid topology:', error);
      throw error;
    }
  }

  /**
   * Get current topology (cached)
   */
  getCurrentTopology(): GridTopology | null {
    return this.currentTopology;
  }

  /**
   * Filter nodes by criteria
   */
  filterNodes(nodes: GridNode[], filter: {
    regions?: string[];
    nodeTypes?: string[];
    energyStatus?: string[];
    minCapacity?: number;
    searchQuery?: string;
  }): GridNode[] {
    return nodes.filter(node => {
      // Region filter
      if (filter.regions && filter.regions.length > 0) {
        if (!filter.regions.includes(node.region)) return false;
      }

      // Node type filter
      if (filter.nodeTypes && filter.nodeTypes.length > 0) {
        if (!filter.nodeTypes.includes(node.type)) return false;
      }

      // Energy status filter
      if (filter.energyStatus && filter.energyStatus.length > 0) {
        if (!filter.energyStatus.includes(node.energyStatus)) return false;
      }

      // Minimum capacity filter
      if (filter.minCapacity !== undefined && node.capacity < filter.minCapacity) {
        return false;
      }

      // Search query filter
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const matchesName = node.name.toLowerCase().includes(query);
        const matchesRegion = node.region.toLowerCase().includes(query);
        const matchesOwner = node.owner.name.toLowerCase().includes(query);
        if (!matchesName && !matchesRegion && !matchesOwner) return false;
      }

      return true;
    });
  }

  /**
   * Filter edges by node IDs
   */
  filterEdges(edges: GridEdge[], nodeIds: Set<string>): GridEdge[] {
    return edges.filter(edge => 
      nodeIds.has(edge.sourceNodeId) && nodeIds.has(edge.targetNodeId)
    );
  }

  /**
   * Calculate total grid metrics
   */
  calculateMetrics(topology: GridTopology): {
    totalCapacity: number;
    totalDemand: number;
    renewablePercentage: number;
    surplusNodes: number;
    deficitNodes: number;
    averageCapacityUtilization: number;
  } {
    const nodes = topology.nodes;
    const edges = topology.edges;

    const totalCapacity = nodes.reduce((sum, node) => sum + node.capacity, 0);
    const totalDemand = nodes
      .filter(node => node.type === 'consumer')
      .reduce((sum, node) => sum + node.currentOutput, 0);
    
    const renewableCapacity = nodes
      .filter(node => node.renewablePercentage && node.renewablePercentage > 0)
      .reduce((sum, node) => sum + (node.capacity * (node.renewablePercentage || 0) / 100), 0);
    
    const surplusNodes = nodes.filter(node => node.energyStatus === 'surplus').length;
    const deficitNodes = nodes.filter(node => node.energyStatus === 'deficit').length;
    
    const totalUtilization = nodes.reduce((sum, node) => {
      return sum + (node.currentOutput / node.capacity);
    }, 0);
    const averageCapacityUtilization = totalUtilization / nodes.length;

    return {
      totalCapacity,
      totalDemand,
      renewablePercentage: (renewableCapacity / totalCapacity) * 100,
      surplusNodes,
      deficitNodes,
      averageCapacityUtilization,
    };
  }

  /**
   * Generate mock topology data for testing
   */
  private generateMockTopology(): GridTopology {
    const now = new Date().toISOString();
    
    // Create nodes representing a regional grid
    const nodes: GridNode[] = [
      // Solar farms
      {
        id: 'solar-1',
        name: 'Mojave Solar Farm',
        type: 'solar_farm',
        coordinates: { lat: 35.0110, lng: -117.5624 },
        capacity: 500,
        currentOutput: 420,
        status: 'online',
        energyStatus: 'surplus',
        owner: { id: 'owner-1', name: 'SolarCorp DAO', type: 'dao' },
        region: 'California',
        zone: 'CAISO',
        renewablePercentage: 100,
        lastUpdated: now,
      },
      {
        id: 'solar-2',
        name: 'Desert Sun Solar',
        type: 'solar_farm',
        coordinates: { lat: 36.7783, lng: -119.4179 },
        capacity: 350,
        currentOutput: 180,
        status: 'online',
        energyStatus: 'deficit',
        owner: { id: 'owner-2', name: 'GreenEnergy Co-op', type: 'cooperative' },
        region: 'California',
        zone: 'CAISO',
        renewablePercentage: 100,
        lastUpdated: now,
      },
      // Wind farms
      {
        id: 'wind-1',
        name: 'Altamont Pass Wind',
        type: 'wind_farm',
        coordinates: { lat: 37.7937, lng: -121.6607 },
        capacity: 400,
        currentOutput: 340,
        status: 'online',
        energyStatus: 'surplus',
        owner: { id: 'owner-3', name: 'WindPower Utility', type: 'utility' },
        region: 'California',
        zone: 'CAISO',
        renewablePercentage: 100,
        lastUpdated: now,
      },
      {
        id: 'wind-2',
        name: 'Tehachapi Wind',
        type: 'wind_farm',
        coordinates: { lat: 35.2135, lng: -118.5303 },
        capacity: 600,
        currentOutput: 250,
        status: 'online',
        energyStatus: 'deficit',
        owner: { id: 'owner-4', name: 'EcoDAO', type: 'dao' },
        region: 'California',
        zone: 'CAISO',
        renewablePercentage: 100,
        lastUpdated: now,
      },
      // Natural gas plant
      {
        id: 'gas-1',
        name: 'San Onofre Gas',
        type: 'gas_plant',
        coordinates: { lat: 33.3667, lng: -117.5556 },
        capacity: 800,
        currentOutput: 600,
        status: 'online',
        energyStatus: 'balanced',
        owner: { id: 'owner-5', name: 'EnergyCorp', type: 'utility' },
        region: 'Southern California',
        zone: 'CAISO',
        renewablePercentage: 0,
        lastUpdated: now,
      },
      // Storage facilities
      {
        id: 'storage-1',
        name: 'Battery Storage Alpha',
        type: 'storage',
        coordinates: { lat: 34.0522, lng: -118.2437 },
        capacity: 200, // Output capacity
        currentOutput: -50, // Negative = charging
        storedEnergy: 350,
        status: 'online',
        energyStatus: 'balanced',
        owner: { id: 'owner-6', name: 'StorageDAO', type: 'dao' },
        region: 'Los Angeles',
        zone: 'CAISO',
        renewablePercentage: 100,
        lastUpdated: now,
      },
      {
        id: 'storage-2',
        name: 'Pumped Hydro Storage',
        type: 'storage',
        coordinates: { lat: 36.9719, lng: -118.2319 },
        capacity: 450,
        currentOutput: 180,
        storedEnergy: 1200,
        status: 'online',
        energyStatus: 'surplus',
        owner: { id: 'owner-7', name: 'HydroPower Inc', type: 'utility' },
        region: 'Sierra Nevada',
        zone: 'CAISO',
        renewablePercentage: 100,
        lastUpdated: now,
      },
      // Consumer nodes (representing major demand centers)
      {
        id: 'consumer-1',
        name: 'Los Angeles Metro',
        type: 'consumer',
        coordinates: { lat: 34.0522, lng: -118.2437 },
        capacity: 1200, // Peak demand
        currentOutput: 980,
        status: 'online',
        energyStatus: 'deficit',
        owner: { id: 'owner-8', name: 'LADWP', type: 'utility' },
        region: 'Los Angeles',
        zone: 'CAISO',
        lastUpdated: now,
      },
      {
        id: 'consumer-2',
        name: 'San Francisco Bay',
        type: 'consumer',
        coordinates: { lat: 37.7749, lng: -122.4194 },
        capacity: 900,
        currentOutput: 720,
        status: 'online',
        energyStatus: 'balanced',
        owner: { id: 'owner-9', name: 'PG&E', type: 'utility' },
        region: 'Bay Area',
        zone: 'CAISO',
        lastUpdated: now,
      },
      // Substation
      {
        id: 'sub-1',
        name: 'San Bernardino Substation',
        type: 'substation',
        coordinates: { lat: 34.1083, lng: -117.2898 },
        capacity: 2000,
        currentOutput: 1500,
        status: 'online',
        energyStatus: 'balanced',
        owner: { id: 'owner-10', name: 'CAISO', type: 'utility' },
        region: 'Southern California',
        zone: 'CAISO',
        lastUpdated: now,
      },
    ];

    // Create edges representing transmission lines
    const edges: GridEdge[] = [
      // Solar to substation
      {
        id: 'edge-1',
        sourceNodeId: 'solar-1',
        targetNodeId: 'sub-1',
        capacity: 500,
        currentFlow: 420,
        direction: 'forward',
        voltage: 230,
        distance: 120,
        status: 'active',
        efficiency: 0.96,
        lastUpdated: now,
      },
      // Wind to substation
      {
        id: 'edge-2',
        sourceNodeId: 'wind-1',
        targetNodeId: 'sub-1',
        capacity: 400,
        currentFlow: 340,
        direction: 'forward',
        voltage: 230,
        distance: 85,
        status: 'active',
        efficiency: 0.97,
        lastUpdated: now,
      },
      // Gas to consumer
      {
        id: 'edge-3',
        sourceNodeId: 'gas-1',
        targetNodeId: 'consumer-1',
        capacity: 800,
        currentFlow: 400,
        direction: 'forward',
        voltage: 345,
        distance: 60,
        status: 'active',
        efficiency: 0.98,
        lastUpdated: now,
      },
      // Storage to consumer (discharging)
      {
        id: 'edge-4',
        sourceNodeId: 'storage-1',
        targetNodeId: 'consumer-1',
        capacity: 200,
        currentFlow: -50, // Negative means from consumer to storage (charging) or reversed
        direction: 'bidirectional',
        voltage: 138,
        distance: 15,
        status: 'active',
        efficiency: 0.92,
        lastUpdated: now,
      },
      // Storage charging from consumer
      {
        id: 'edge-5',
        sourceNodeId: 'consumer-1',
        targetNodeId: 'storage-1',
        capacity: 150,
        currentFlow: 50,
        direction: 'bidirectional',
        voltage: 138,
        distance: 15,
        status: 'active',
        efficiency: 0.92,
        lastUpdated: now,
      },
      // Hydro storage to substation
      {
        id: 'edge-6',
        sourceNodeId: 'storage-2',
        targetNodeId: 'sub-1',
        capacity: 450,
        currentFlow: 180,
        direction: 'forward',
        voltage: 230,
        distance: 150,
        status: 'active',
        efficiency: 0.94,
        lastUpdated: now,
      },
      // Substation to SF consumer
      {
        id: 'edge-7',
        sourceNodeId: 'sub-1',
        targetNodeId: 'consumer-2',
        capacity: 600,
        currentFlow: 320,
        direction: 'forward',
        voltage: 230,
        distance: 550,
        status: 'active',
        efficiency: 0.95,
        lastUpdated: now,
      },
      // Wind 2 to substation
      {
        id: 'edge-8',
        sourceNodeId: 'wind-2',
        targetNodeId: 'sub-1',
        capacity: 600,
        currentFlow: 250,
        direction: 'forward',
        voltage: 230,
        distance: 120,
        status: 'active',
        efficiency: 0.97,
        lastUpdated: now,
      },
      // Solar 2 to substation
      {
        id: 'edge-9',
        sourceNodeId: 'solar-2',
        targetNodeId: 'sub-1',
        capacity: 350,
        currentFlow: 180,
        direction: 'forward',
        voltage: 230,
        distance: 200,
        status: 'active',
        efficiency: 0.96,
        lastUpdated: now,
      },
    ];

    // Calculate grid metrics
    const totalCapacity = nodes.reduce((sum, node) => sum + node.capacity, 0);
    const totalDemand = nodes
      .filter(node => node.type === 'consumer')
      .reduce((sum, node) => sum + node.currentOutput, 0);
    
    const renewableCapacity = nodes
      .filter(node => node.renewablePercentage && node.renewablePercentage > 0)
      .reduce((sum, node) => sum + (node.capacity * (node.renewablePercentage || 0) / 100), 0);

    return {
      nodes,
      edges,
      metadata: {
        totalCapacity,
        totalDemand,
        renewablePercentage: (renewableCapacity / totalCapacity) * 100,
        regions: [...new Set(nodes.map(n => n.region))],
        lastUpdated: now,
      },
    };
  }

  /**
   * Get node by ID
   */
  getNodeById(topology: GridTopology, nodeId: string): GridNode | undefined {
    return topology.nodes.find(n => n.id === nodeId);
  }

  /**
   * Get connected nodes for a given node
   */
  getConnectedNodes(topology: GridTopology, nodeId: string): Array<{ node: GridNode; edge: GridEdge }> {
    const connections: Array<{ node: GridNode; edge: GridEdge }> = [];
    
    for (const edge of topology.edges) {
      if (edge.sourceNodeId === nodeId) {
        const targetNode = topology.nodes.find(n => n.id === edge.targetNodeId);
        if (targetNode) {
          connections.push({ node: targetNode, edge });
        }
      } else if (edge.targetNodeId === nodeId) {
        const sourceNode = topology.nodes.find(n => n.id === edge.sourceNodeId);
        if (sourceNode) {
          connections.push({ node: sourceNode, edge });
        }
      }
    }
    
    return connections;
  }

  /**
   * Calculate energy flow between two nodes
   */
  getFlowBetweenNodes(topology: GridTopology, nodeId1: string, nodeId2: string): number {
    const edge = topology.edges.find(
      e => (e.sourceNodeId === nodeId1 && e.targetNodeId === nodeId2) ||
           (e.sourceNodeId === nodeId2 && e.targetNodeId === nodeId1)
    );
    return edge ? Math.abs(edge.currentFlow) : 0;
  }
}

// Export singleton instance
export const gridTopologyService = GridTopologyService.getInstance();
