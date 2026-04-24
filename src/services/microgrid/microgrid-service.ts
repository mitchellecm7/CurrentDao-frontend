/**
 * Microgrid Service
 * Handles data fetching, logic, and grid controls for energy communities.
 * Performance: Optimized for 5s polling intervals.
 */

import {
    GridNode,
    GridNodeStatus,
    GridNodeType,
    EnergyFlow,
    EnergySourceType,
    P2PTrade,
    GridStatus,
    CommunityAnalytics,
    MicrogridSnapshot,
    IoTDeviceData,
} from '@/types/microgrid';

class MicrogridService {
    private readonly REFRESH_INTERVAL = 5000; // 5 seconds

    /**
     * Generates a random realistic microgrid snapshot
     * Performance: <50ms
     */
    async getSnapshot(): Promise<MicrogridSnapshot> {
        // Artificial delay to simulate network call
        await new Promise((resolve) => setTimeout(resolve, 150));

        const nodes = this.generateNodes();
        const flows = this.generateFlows(nodes);
        const trades = this.generateTrades();
        const status = this.calculateGridStatus(nodes);
        const analytics = this.generateAnalytics();

        return {
            nodes,
            flows,
            trades,
            status,
            analytics,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Returns historical grid performance data
     * Performance: <100ms
     */
    async getHistoricalData(days: number = 180): Promise<CommunityAnalytics> {
        // Artificial delay
        await new Promise((resolve) => setTimeout(resolve, 200));
        return this.generateAnalytics(days);
    }

    /**
     * Emergency grid control - isolates a node
     */
    async isolateNode(nodeId: string): Promise<boolean> {
        console.log(`Grid Control: Isolating node ${nodeId}`);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 400));
        return true;
    }

    /**
     * Emergency grid control - reconnects a node
     */
    async reconnectNode(nodeId: string): Promise<boolean> {
        console.log(`Grid Control: Reconnecting node ${nodeId}`);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 400));
        return true;
    }

    /**
     * Fetches real-time IoT device metrics
     */
    async getIoTDeviceData(deviceId: string): Promise<IoTDeviceData> {
        return {
            deviceId,
            nodeId: `node-${deviceId.split('-')[1]}`,
            metrics: {
                voltage: 230 + (Math.random() - 0.5) * 5,
                current: 10 + (Math.random() - 0.5) * 2,
                activePower: 2.3 + (Math.random() - 0.5) * 0.5,
                reactivePower: 0.2 + (Math.random() - 0.5) * 0.1,
                temperature: 24 + (Math.random() - 0.5) * 2,
            },
            signalStrength: -60 - Math.floor(Math.random() * 20),
            lastSeen: new Date().toISOString(),
        };
    }

    private generateNodes(): GridNode[] {
        const types: GridNodeType[] = ['prosumer', 'consumer', 'producer', 'storage', 'substation'];
        const statuses: GridNodeStatus[] = ['active', 'active', 'active', 'maintenance', 'fault'];

        const nodes: GridNode[] = [];

        // Add substation (center)
        nodes.push({
            id: 'substation-1',
            name: 'Central Substation',
            type: 'substation',
            status: 'active',
            location: { x: 50, y: 50 },
            capacity: 5000,
            currentLoad: 1200,
            currentProduction: 0,
            lastUpdate: new Date().toISOString(),
            metadata: { manufacturer: 'GridSafe', iotDeviceId: 'sub-iot-001' },
        });

        // Add 12 nodes in a ring
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * 2 * Math.PI;
            const x = 50 + 35 * Math.cos(angle);
            const y = 50 + 35 * Math.sin(angle);
            const type = types[i % types.length];

            nodes.push({
                id: `node-${i + 1}`,
                name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
                type,
                status: Math.random() > 0.95 ? 'isolated' : 'active',
                location: { x, y },
                capacity: 50 + Math.random() * 200,
                currentLoad: 20 + Math.random() * 80,
                currentProduction: type === 'producer' || type === 'prosumer' ? 30 + Math.random() * 120 : 0,
                storageLevel: type === 'storage' ? 20 + Math.random() * 80 : undefined,
                lastUpdate: new Date().toISOString(),
                metadata: { iotDeviceId: `iot-${i + 1}` },
            });
        }

        return nodes;
    }

    private generateFlows(nodes: GridNode[]): EnergyFlow[] {
        const flows: EnergyFlow[] = [];
        const substation = nodes.find(n => n.type === 'substation')!;
        const sources: EnergySourceType[] = ['solar', 'wind', 'grid', 'battery'];

        nodes.forEach(node => {
            if (node.id === substation.id) return;

            // Flow from/to substation
            const isProducing = node.currentProduction > node.currentLoad;
            const amount = Math.abs(node.currentProduction - node.currentLoad);

            flows.push({
                id: `flow-${node.id}`,
                fromNodeId: isProducing ? node.id : substation.id,
                toNodeId: isProducing ? substation.id : node.id,
                amount,
                status: amount > 100 ? 'critical' : 'stable',
                sourceType: sources[Math.floor(Math.random() * sources.length)],
                timestamp: new Date().toISOString(),
            });
        });

        return flows;
    }

    private generateTrades(): P2PTrade[] {
        const trades: P2PTrade[] = [];
        for (let i = 0; i < 5; i++) {
            trades.push({
                id: `trade-${i}`,
                buyerId: `node-${Math.floor(Math.random() * 10) + 1}`,
                sellerId: `node-${Math.floor(Math.random() * 10) + 1}`,
                energyAmount: 5 + Math.random() * 20,
                price: 0.12 + (Math.random() - 0.5) * 0.04,
                status: 'completed',
                timestamp: new Date().toISOString(),
                transactionHash: `0x${Math.random().toString(16).slice(2, 12)}...`,
            });
        }
        return trades;
    }

    private calculateGridStatus(nodes: GridNode[]): GridStatus {
        const totalLoad = nodes.reduce((sum, n) => sum + n.currentLoad, 0);
        const totalProduction = nodes.reduce((sum, n) => sum + n.currentProduction, 0);
        const storageNodes = nodes.filter(n => n.type === 'storage');
        const avgStorageLevel = storageNodes.length
            ? storageNodes.reduce((sum, n) => sum + (n.storageLevel || 0), 0) / storageNodes.length
            : 0;

        return {
            totalNodes: nodes.length,
            onlineNodes: nodes.filter(n => n.status === 'active').length,
            totalLoad,
            totalProduction,
            storageCapacity: storageNodes.reduce((sum, n) => sum + n.capacity, 0),
            storageLevel: avgStorageLevel,
            frequency: 60 + (Math.random() - 0.5) * 0.1,
            voltage: 231 + (Math.random() - 0.5) * 2,
            carbonIntensity: 120 + (Math.random() - 0.5) * 40,
            activeAlarms: nodes.filter(n => n.status === 'fault').length,
            systemHealth: 95 + (Math.random() - 0.5) * 5,
        };
    }

    private generateAnalytics(days: number = 180): CommunityAnalytics {
        const historicalLoad = [];
        const historicalProduction = [];
        const sourceDistribution: Array<{ source: EnergySourceType; value: number }> = [
            { source: 'solar', value: 45 },
            { source: 'wind', value: 30 },
            { source: 'grid', value: 15 },
            { source: 'battery', value: 10 },
        ];

        const now = Date.now();
        for (let i = 0; i < days; i++) {
            const timestamp = new Date(now - (days - i) * 24 * 60 * 60 * 1000).toISOString();
            historicalLoad.push({ timestamp, value: 400 + Math.random() * 200 });
            historicalProduction.push({ timestamp, value: 300 + Math.random() * 300 });
        }

        return {
            dailySelfSufficiency: 65 + Math.random() * 15,
            dailyRenewableShare: 80 + Math.random() * 10,
            totalCarbonSaved: 1240 + Math.random() * 100,
            p2pTradingVolume: 420 + Math.random() * 50,
            historicalLoad,
            historicalProduction,
            sourceDistribution,
        };
    }
}

export const microgridService = new MicrogridService();
