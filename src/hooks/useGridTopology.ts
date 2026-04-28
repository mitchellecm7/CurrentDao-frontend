import { useState, useEffect, useCallback } from 'react';
import { GridTopology, GridNode, GridEdge, GridNodeFilter } from '../types/grid-topology';
import { gridTopologyService } from '../services/grid/topology-service';

interface UseGridTopologyOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseGridTopologyReturn {
  topology: GridTopology | null;
  nodes: GridNode[];
  edges: GridEdge[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  filter: GridNodeFilter;
  setFilter: (filter: GridNodeFilter) => void;
  refresh: () => Promise<void>;
  getNodeById: (nodeId: string) => GridNode | undefined;
  getConnectedNodes: (nodeId: string) => Array<{ node: GridNode; edge: GridEdge }>;
  getMetrics: () => {
    totalCapacity: number;
    totalDemand: number;
    renewablePercentage: number;
    surplusNodes: number;
    deficitNodes: number;
    averageCapacityUtilization: number;
  } | null;
}

/**
 * Hook for managing grid topology data with auto-refresh
 */
export const useGridTopology = (options: UseGridTopologyOptions = {}): UseGridTopologyReturn => {
  const { autoRefresh = true, refreshInterval = 60000 } = options;
  
  const [topology, setTopology] = useState<GridTopology | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filter, setFilterState] = useState<GridNodeFilter>({});

  // Load initial data
  useEffect(() => {
    loadTopology();
  }, []);

  // Set up auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadTopology();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = gridTopologyService.subscribe((newTopology) => {
      setTopology(newTopology);
      setLastUpdated(new Date());
      setIsLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, []);

  const loadTopology = async () => {
    try {
      setIsLoading(true);
      const data = await gridTopologyService.fetchTopology();
      setTopology(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load topology');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = useCallback(async () => {
    await loadTopology();
  }, []);

  // Get filtered nodes based on current filter
  const nodes = topology ? gridTopologyService.filterNodes(topology.nodes, filter) : [];
  
  // Get edges that connect filtered nodes
  const edges = topology 
    ? gridTopologyService.filterEdges(topology.edges, new Set(nodes.map(n => n.id)))
    : [];

  const getNodeById = useCallback((nodeId: string): GridNode | undefined => {
    return topology?.nodes.find(n => n.id === nodeId);
  }, [topology]);

  const getConnectedNodes = useCallback((nodeId: string): Array<{ node: GridNode; edge: GridEdge }> => {
    if (!topology) return [];
    return gridTopologyService.getConnectedNodes(topology, nodeId);
  }, [topology]);

  const getMetrics = useCallback((): {
    totalCapacity: number;
    totalDemand: number;
    renewablePercentage: number;
    surplusNodes: number;
    deficitNodes: number;
    averageCapacityUtilization: number;
  } | null => {
    if (!topology) return null;
    return gridTopologyService.calculateMetrics(topology);
  }, [topology]);

  return {
    topology,
    nodes,
    edges,
    isLoading,
    error,
    lastUpdated,
    filter,
    setFilter: setFilterState,
    refresh,
    getNodeById,
    getConnectedNodes,
    getMetrics,
  };
};
