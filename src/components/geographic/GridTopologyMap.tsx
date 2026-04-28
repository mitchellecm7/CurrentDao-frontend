import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useGridTopology } from '../../hooks/useGridTopology';
import { 
  GridNode, 
  GridEdge, 
  GridNodeDetails,
  NODE_TYPE_COLORS,
  ENERGY_STATUS_COLORS,
  NODE_SIZE_RANGE,
  EDGE_WIDTH_RANGE,
  NodeType,
  EnergyStatus
} from '../../types/grid-topology';
import { NodeDetailsModal } from './NodeDetailsModal';
import { FilterControls } from './FilterControls';

interface GridTopologyMapProps {
  width?: number | string;
  height?: number | string;
  showControls?: boolean;
  showFilters?: boolean;
  onNodeSelect?: (node: GridNodeDetails) => void;
}

export const GridTopologyMap: React.FC<GridTopologyMapProps> = ({
  width = '100%',
  height = 600,
  showControls = true,
  showFilters = true,
  onNodeSelect,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GridNode, GridEdge> | null>(null);
  
  const { nodes, edges, isLoading, error, filter, setFilter, getNodeById, getConnectedNodes, getMetrics, refresh } = useGridTopology({
    autoRefresh: true,
    refreshInterval: 60000, // 60 seconds
  });

  const [selectedNode, setSelectedNode] = useState<GridNodeDetails | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        const { clientWidth, clientHeight } = svgRef.current.parentElement;
        setDimensions({ width: clientWidth, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  // D3 Force simulation
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    const container = svg.append('g').attr('class', 'graph-container');

    // Create force simulation
    const simulation = d3.forceSimulation<GridNode>(nodes)
      .force('link', d3.forceLink<GridNode, GridEdge>(edges)
        .id(d => d.id)
        .distance(100)
        .strength(0.5))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide<GridNode>().radius(d => getNodeSize(d) + 5));

    // Draw edges
    const linkGroup = container.append('g').attr('class', 'links');
    const links = linkGroup.selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => {
        const normalizedFlow = Math.min(Math.abs(d.currentFlow) / 500, 1);
        return EDGE_WIDTH_RANGE.min + normalizedFlow * (EDGE_WIDTH_RANGE.max - EDGE_WIDTH_RANGE.min);
      })
      .attr('stroke-dasharray', d => d.direction === 'bidirectional' ? '5,5' : 'none');

    // Add flow direction arrows
    const arrows = container.append('g').attr('class', 'arrows');
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.sourceNodeId);
      const targetNode = nodes.find(n => n.id === edge.targetNodeId);
      if (!sourceNode || !targetNode) return;

      const angle = Math.atan2(targetNode.coordinates.lat - sourceNode.coordinates.lat, 
                               targetNode.coordinates.lng - sourceNode.coordinates.lng);
      
      // Position arrow midway
      const midX = (sourceNode.coordinates.lng + targetNode.coordinates.lng) / 2;
      const midY = (sourceNode.coordinates.lat + targetNode.coordinates.lat) / 2;
      
      arrows.append('text')
        .attr('x', midX)
        .attr('y', midY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .text(edge.currentFlow > 0 ? '→' : '←');
    });

    // Draw nodes
    const nodeGroup = container.append('g').attr('class', 'nodes');
    const nodesSelection = nodeGroup.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GridNode>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded) as any);

    // Node circles
    nodesSelection.append('circle')
      .attr('r', d => getNodeSize(d))
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', d => hoveredNodeId === d.id ? '#fff' : NODE_TYPE_COLORS[d.type])
      .attr('stroke-width', d => hoveredNodeId === d.id ? 3 : 2)
      .attr('opacity', 0.9)
      .on('click', (event, d) => handleNodeClick(d))
      .on('mouseenter', (event, d) => {
        setHoveredNodeId(d.id);
        highlightConnections(d.id);
      })
      .on('mouseleave', (event, d) => {
        setHoveredNodeId(null);
        clearHighlights();
      });

    // Node labels
    nodesSelection.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => getNodeSize(d) + 15)
      .attr('font-size', '10px')
      .attr('fill', '#374151')
      .text(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name);

    // Node energy status indicator (small dot)
    nodesSelection.append('circle')
      .attr('r', 4)
      .attr('cx', d => getNodeSize(d) - 5)
      .attr('cy', -getNodeSize(d) + 5)
      .attr('fill', d => ENERGY_STATUS_COLORS[d.energyStatus]);

    // Update positions on tick
    simulation.on('tick', () => {
      links
        .attr('x1', d => (d.source as GridNode).coordinates.lng)
        .attr('y1', d => (d.source as GridNode).coordinates.lat)
        .attr('x2', d => (d.target as GridNode).coordinates.lng)
        .attr('y2', d => (d.target as GridNode).coordinates.lat);

      nodesSelection
        .attr('transform', d => `translate(${d.coordinates.lng}, ${d.coordinates.lat})`);
    });

    // Drag functions
    function dragStarted(event: d3.D3DragEvent<SVGGElement, GridNode, GridNode>, d: GridNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.coordinates.lng;
      d.fy = d.coordinates.lat;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, GridNode, GridNode>, d: GridNode) {
      d.fx = event.x;
      d.fy = event.y;
      d.coordinates.lng = event.x;
      d.coordinates.lat = event.y;
    }

    function dragEnded(event: d3.D3DragEvent<SVGGElement, GridNode, GridNode>, d: GridNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Highlight connected edges for a node
    function highlightConnections(nodeId: string) {
      const connectedEdgeIds = new Set<string>();
      nodes.forEach(node => {
        if (node.id === nodeId) {
          // Find all edges connected to this node
          edges.forEach(edge => {
            if (edge.sourceNodeId === nodeId || edge.targetNodeId === nodeId) {
              connectedEdgeIds.add(edge.id);
            }
          });
        }
      });

      links
        .attr('stroke-opacity', d => connectedEdgeIds.has(d.id) ? 1 : 0.1)
        .attr('stroke-width', d => connectedEdgeIds.has(d.id) ? 3 : 1);
    }

    function clearHighlights() {
      links
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', d => {
          const normalizedFlow = Math.min(Math.abs(d.currentFlow) / 500, 1);
          return EDGE_WIDTH_RANGE.min + normalizedFlow * (EDGE_WIDTH_RANGE.max - EDGE_WIDTH_RANGE.min);
        });
    }

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, dimensions]);

  // Handle node click
  const handleNodeClick = (node: GridNode) => {
    const connectedNodes = getConnectedNodes(node.id);
    const nodeDetails: GridNodeDetails = {
      ...node,
      utilizationRate: node.currentOutput / node.capacity,
      surplusAmount: node.currentOutput - (node.type === 'consumer' ? node.capacity * 0.8 : 0),
      carbonIntensity: node.type === 'gas_plant' ? 450 : node.type === 'coal_plant' ? 900 : 50,
      projectedOutput: node.currentOutput * (0.9 + Math.random() * 0.2),
      connectedEdges: connectedNodes.map(c => ({
        edgeId: c.edge.id,
        connectedNodeId: c.node.id,
        connectedNodeName: c.node.name,
        flow: c.edge.currentFlow,
      })),
      recentTransactions: [
        // Mock recent transactions
        {
          id: 'tx1',
          type: 'sell',
          counterparty: 'EnergyBuyer DAO',
          amount: 100,
          price: 45.50,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'tx2',
          type: 'buy',
          counterparty: 'StorageDAO',
          amount: 50,
          price: 42.00,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
      ],
    };

    setSelectedNode(nodeDetails);
    onNodeSelect?.(nodeDetails);
  };

  // Get node size based on capacity
  const getNodeSize = (node: GridNode): number => {
    const minCap = Math.min(...nodes.map(n => n.capacity));
    const maxCap = Math.max(...nodes.map(n => n.capacity));
    const normalized = (node.capacity - minCap) / (maxCap - minCap || 1);
    return NODE_SIZE_RANGE.min + normalized * (NODE_SIZE_RANGE.max - NODE_SIZE_RANGE.min);
  };

  // Get node color based on type and status
  const getNodeColor = (node: GridNode): string => {
    // If there's an energy status override (like deficit), use that color
    if (node.energyStatus === 'deficit') return ENERGY_STATUS_COLORS.deficit;
    if (node.energyStatus === 'surplus') return ENERGY_STATUS_COLORS.surplus;
    return NODE_TYPE_COLORS[node.type];
  };

  const metrics = getMetrics();

  return (
    <div className="w-full" style={{ height }}>
      {showFilters && (
        <FilterControls 
          filter={filter}
          onFilterChange={setFilter}
          metrics={metrics}
          onRefresh={refresh}
          isLoading={isLoading}
        />
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Error loading grid topology: {error}
        </div>
      )}

      {isLoading && nodes.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading grid topology...</p>
          </div>
        </div>
      ) : (
        <svg
          ref={svgRef}
          width={width}
          height={dimensions.height}
          className="border border-gray-200 rounded-lg bg-gray-50"
        />
      )}

      {/* Legend */}
      {showControls && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium">Node Types:</span>
            {Object.entries(NODE_TYPE_COLORS).slice(0, 5).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="capitalize">{type.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            {Object.entries(ENERGY_STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Node Details Modal */}
      {selectedNode && (
        <NodeDetailsModal
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onSignTransaction={async (tx) => {
            // TODO: Implement transaction signing
            console.log('Signing transaction:', tx);
          }}
        />
      )}
    </div>
  );
};

export default GridTopologyMap;
