'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Maximize2,
    Map as MapIcon,
    Activity,
    Zap,
    Battery,
    Home,
    ExternalLink,
    ShieldAlert,
    Power,
    Info,
    ChevronRight,
    TrendingDown,
    Cpu,
    Sun,
    Wifi,
    WifiOff,
    Thermometer,
    Gauge,
    BoltIcon,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    X
} from 'lucide-react'
import { useMicrogridData } from '@/hooks/useMicrogridData'
import { GridNode, IoTDeviceData } from '@/types/microgrid'
import { EnergyFlow } from './EnergyFlow'
import { P2PTrading } from './P2PTrading'
import { GridStatus } from './GridStatus'
import { CommunityAnalytics } from './CommunityAnalytics'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────────────────────────────────────
function GridLoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-slate-200 rounded-xl" />
                    <div className="h-4 w-48 bg-slate-100 rounded-lg" />
                </div>
                <div className="h-12 w-72 bg-slate-100 rounded-2xl" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 bg-slate-100 rounded-2xl" />
                ))}
            </div>
            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
                <div className="h-[650px] bg-slate-900/20 rounded-[2.5rem]" />
                <div className="space-y-4">
                    <div className="h-[480px] bg-slate-100 rounded-[2.5rem]" />
                    <div className="h-[200px] bg-slate-100 rounded-[2.5rem]" />
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// IoT Device Panel
// ─────────────────────────────────────────────────────────────────────────────
interface IoTPanelProps {
    deviceData: IoTDeviceData | null
    loading: boolean
    onClose: () => void
}

function IoTPanel({ deviceData, loading, onClose }: IoTPanelProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                className="bg-slate-900 rounded-[2rem] border border-slate-700 shadow-2xl p-6 w-full max-w-md text-white"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">IoT Smart Meter</p>
                        <h3 className="text-xl font-bold">Real-Time Diagnostics</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-3 animate-pulse">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-14 bg-white/5 rounded-2xl" />
                        ))}
                    </div>
                ) : deviceData ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Gauge className="w-4 h-4 text-yellow-400" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voltage</p>
                                </div>
                                <p className="text-2xl font-black text-yellow-400">{deviceData.metrics.voltage.toFixed(1)}V</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-4 h-4 text-blue-400" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current</p>
                                </div>
                                <p className="text-2xl font-black text-blue-400">{deviceData.metrics.current.toFixed(1)}A</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="w-4 h-4 text-emerald-400" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Power</p>
                                </div>
                                <p className="text-2xl font-black text-emerald-400">{deviceData.metrics.activePower.toFixed(2)} kW</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Thermometer className="w-4 h-4 text-red-400" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temperature</p>
                                </div>
                                <p className="text-2xl font-black text-red-400">{deviceData.metrics.temperature.toFixed(1)}°C</p>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {deviceData.signalStrength > -70 ? (
                                        <Wifi className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                        <WifiOff className="w-4 h-4 text-red-400" />
                                    )}
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signal Strength</p>
                                </div>
                                <span className={`text-sm font-black ${deviceData.signalStrength > -70 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {deviceData.signalStrength} dBm
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold uppercase tracking-widest pt-2">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Device ID: {deviceData.deviceId}
                            <span className="ml-auto">Last seen: {new Date(deviceData.lastSeen).toLocaleTimeString()}</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                        <AlertTriangle className="w-8 h-8 mb-2 text-slate-600" />
                        <p className="text-sm font-medium">No IoT data available for this node</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Grid Visualization Component
// ─────────────────────────────────────────────────────────────────────────────
export function GridVisualization() {
    const {
        snapshot,
        isLoading,
        isLive,
        toggleLive,
        isolateNode,
        reconnectNode,
        getIoTMetrics,
        refresh
    } = useMicrogridData()

    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'visual' | 'p2p' | 'analytics'>('visual')
    const [showIoTPanel, setShowIoTPanel] = useState(false)
    const [iotData, setIoTData] = useState<IoTDeviceData | null>(null)
    const [iotLoading, setIoTLoading] = useState(false)

    const selectedNode = snapshot?.nodes.find(n => n.id === selectedNodeId)

    const handleNodeAction = async (node: GridNode) => {
        const isIsolated = node.status === 'isolated'
        const action = isIsolated ? reconnectNode : isolateNode
        const loadingMsg = isIsolated ? `Reconnecting ${node.name}...` : `Isolating ${node.name}...`
        const successMsg = isIsolated ? `${node.name} reconnected to grid` : `⚡ ${node.name} isolated for safety`
        const errorMsg = isIsolated ? `Failed to reconnect ${node.name}` : `Failed to isolate ${node.name}`

        const promise = action(node.id)
        toast.promise(promise, {
            loading: loadingMsg,
            success: successMsg,
            error: errorMsg,
        })
    }

    const handleIoTDebug = useCallback(async (node: GridNode) => {
        if (!node.metadata.iotDeviceId) {
            toast.error('No IoT device linked to this node')
            return
        }
        setShowIoTPanel(true)
        setIoTLoading(true)
        setIoTData(null)
        try {
            const data = await getIoTMetrics(node.metadata.iotDeviceId)
            setIoTData(data)
        } catch {
            toast.error('Failed to fetch IoT metrics')
        } finally {
            setIoTLoading(false)
        }
    }, [getIoTMetrics])

    if (isLoading) return <GridLoadingSkeleton />

    return (
        <div className="space-y-6">
            {/* IoT Panel Modal */}
            <AnimatePresence>
                {showIoTPanel && (
                    <IoTPanel
                        deviceData={iotData}
                        loading={iotLoading}
                        onClose={() => setShowIoTPanel(false)}
                    />
                )}
            </AnimatePresence>

            {/* Header & Main Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Activity className="w-8 h-8 text-blue-600" />
                        Microgrid Commander
                    </h2>
                    <p className="text-slate-500 mt-1">Real-time surveillance and control for community energy</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Refresh button */}
                    <button
                        onClick={() => { refresh(); toast.success('Grid data refreshed') }}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-all"
                        title="Refresh grid data"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setActiveTab('visual')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'visual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <MapIcon className="w-4 h-4" />
                            Live Grid
                        </button>
                        <button
                            onClick={() => setActiveTab('p2p')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'p2p' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Zap className="w-4 h-4" />
                            P2P Market
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'analytics' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <TrendingDown className="w-4 h-4" />
                            Analytics
                        </button>
                    </div>
                </div>
            </div>

            <GridStatus status={snapshot?.status || null} />

            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
                {/* Main Interface Content */}
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {activeTab === 'visual' && (
                            <motion.div
                                key="visual"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="relative h-[650px] bg-slate-950 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden group p-8 touch-pan-y"
                            >
                                {/* Grid Background */}
                                <div className="absolute inset-0 opacity-10 pointer-events-none"
                                    style={{ backgroundImage: 'radial-gradient(#1e40af 1px, transparent 0)', backgroundSize: '40px 40px' }}
                                />

                                {/* Grid Status Header Overlay */}
                                <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">
                                                {isLive ? 'Link: SECURED — LIVE DATA FEED' : 'Link: PAUSED'}
                                            </span>
                                        </div>
                                        <p className="text-xl font-bold text-white tracking-widest uppercase">Grid Visualization α-10</p>
                                    </div>
                                    <button
                                        onClick={toggleLive}
                                        className={`p-3 rounded-2xl border transition-all ${isLive ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-500' : 'bg-red-950/30 border-red-500/30 text-red-500'}`}
                                        title={isLive ? 'Pause live feed' : 'Resume live feed'}
                                    >
                                        <Power className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* SVG Layer for Connections/Flows */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                                    <defs>
                                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" opacity="0.5" />
                                        </marker>
                                    </defs>
                                    {snapshot?.flows.map(flow => {
                                        const fromNode = snapshot.nodes.find(n => n.id === flow.fromNodeId)
                                        const toNode = snapshot.nodes.find(n => n.id === flow.toNodeId)
                                        if (!fromNode || !toNode) return null

                                        return (
                                            <motion.line
                                                key={flow.id}
                                                x1={`${fromNode.location.x}%`}
                                                y1={`${fromNode.location.y}%`}
                                                x2={`${toNode.location.x}%`}
                                                y2={`${toNode.location.y}%`}
                                                stroke={flow.status === 'critical' ? '#ef4444' : '#3b82f6'}
                                                strokeWidth={2}
                                                strokeOpacity={0.4}
                                                strokeDasharray="5,5"
                                                animate={{ strokeDashoffset: [0, -20] }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                markerEnd="url(#arrow)"
                                            />
                                        )
                                    })}
                                </svg>

                                {/* Grid Nodes */}
                                <div className="absolute inset-0 z-20">
                                    {snapshot?.nodes.map((node) => (
                                        <motion.button
                                            key={node.id}
                                            onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
                                            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/node"
                                            style={{ left: `${node.location.x}%`, top: `${node.location.y}%` }}
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <div className={`
                                                relative w-12 h-12 rounded-full flex items-center justify-center border-4 shadow-lg transition-all
                                                ${node.id === selectedNodeId ? 'ring-4 ring-white/30 scale-110' : ''}
                                                ${node.status === 'active'
                                                    ? 'bg-blue-600 border-blue-900/50 shadow-blue-500/20'
                                                    : node.status === 'isolated'
                                                        ? 'bg-red-600 border-red-900/50 shadow-red-500/20'
                                                        : node.status === 'fault'
                                                            ? 'bg-orange-500 border-orange-900/50'
                                                            : 'bg-slate-700 border-slate-900/50'
                                                }
                                            `}>
                                                {node.type === 'substation' && <Zap className="w-5 h-5 text-white" />}
                                                {node.type === 'prosumer' && <Home className="w-5 h-5 text-white" />}
                                                {node.type === 'storage' && <Battery className="w-5 h-5 text-white" />}
                                                {node.type === 'producer' && <Sun className="w-5 h-5 text-white" />}
                                                {node.type === 'consumer' && <Activity className="w-5 h-5 text-white" />}

                                                {/* Pulse ring for producers */}
                                                {(node.currentProduction > 50) && (
                                                    <motion.div
                                                        className="absolute inset-0 rounded-full border-2 border-emerald-500"
                                                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    />
                                                )}

                                                {/* Fault indicator */}
                                                {node.status === 'fault' && (
                                                    <motion.div
                                                        className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-slate-950 flex items-center justify-center"
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ duration: 0.8, repeat: Infinity }}
                                                    >
                                                        <span className="text-[6px] font-black text-white">!</span>
                                                    </motion.div>
                                                )}
                                            </div>
                                            <span className="mt-2 text-[10px] font-bold text-white uppercase tracking-tighter bg-black/50 px-2 py-0.5 rounded-full backdrop-blur transition-opacity opacity-0 group-hover/node:opacity-100">
                                                {node.name}
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Interaction Hint */}
                                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest pointer-events-none">
                                    <span className="flex items-center gap-2"><Maximize2 className="w-3 h-3" /> Tap node for tactical readout</span>
                                    <span className="hidden sm:block">Pacific Palisades Microgrid (α)</span>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'p2p' && (
                            <motion.div
                                key="p2p"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 min-h-[650px]"
                            >
                                <P2PTrading trades={snapshot?.trades || []} nodes={snapshot?.nodes || []} />
                            </motion.div>
                        )}

                        {activeTab === 'analytics' && (
                            <motion.div
                                key="analytics"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 min-h-[650px]"
                            >
                                <CommunityAnalytics analytics={snapshot?.analytics || null} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar Panel - Node Intelligence & Flows */}
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedNode ? (
                            <motion.div
                                key="node-details"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl p-6 text-white"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Grid Asset Readout</p>
                                        <h3 className="text-2xl font-bold tracking-tight">{selectedNode.name}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${selectedNode.status === 'active' ? 'bg-emerald-500' :
                                                    selectedNode.status === 'fault' ? 'bg-orange-500 animate-pulse' : 'bg-red-500'
                                                }`} />
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                                                Status: {selectedNode.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                            {selectedNode.type === 'substation' && <Zap className="w-6 h-6 text-blue-500" />}
                                            {selectedNode.type === 'storage' && <Battery className="w-6 h-6 text-emerald-500" />}
                                            {selectedNode.type === 'producer' && <Sun className="w-6 h-6 text-yellow-500" />}
                                            {selectedNode.type === 'prosumer' && <Home className="w-6 h-6 text-purple-500" />}
                                            {selectedNode.type === 'consumer' && <Activity className="w-6 h-6 text-cyan-500" />}
                                        </div>
                                        <button
                                            onClick={() => setSelectedNodeId(null)}
                                            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                                        >
                                            <X className="w-4 h-4 text-slate-400" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Load Demand</p>
                                        <p className="text-xl font-bold">{selectedNode.currentLoad.toFixed(1)} kW</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Production</p>
                                        <p className="text-xl font-bold text-emerald-400">{selectedNode.currentProduction.toFixed(1)} kW</p>
                                    </div>
                                    {selectedNode.storageLevel !== undefined && (
                                        <div className="col-span-2 bg-white/5 p-4 rounded-3xl border border-white/10">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Storage Level</p>
                                                <span className="text-sm font-black text-emerald-400">{selectedNode.storageLevel.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-emerald-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${selectedNode.storageLevel}%` }}
                                                    transition={{ duration: 0.8 }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center justify-between text-xs py-2.5 border-b border-white/5">
                                        <span className="text-slate-400 font-bold uppercase tracking-widest">Asset Category</span>
                                        <span className="text-white font-black capitalize">{selectedNode.type}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs py-2.5 border-b border-white/5">
                                        <span className="text-slate-400 font-bold uppercase tracking-widest">Operational Capacity</span>
                                        <span className="text-white font-black">{selectedNode.capacity.toFixed(0)} kW</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs py-2.5 border-b border-white/5">
                                        <span className="text-slate-400 font-bold uppercase tracking-widest">IoT Device</span>
                                        <span className="text-cyan-400 font-bold font-mono text-[11px]">{selectedNode.metadata.iotDeviceId || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs py-2.5">
                                        <span className="text-slate-400 font-bold uppercase tracking-widest">Last Update</span>
                                        <span className="text-slate-300 font-bold">{new Date(selectedNode.lastUpdate).toLocaleTimeString()}</span>
                                    </div>
                                </div>

                                {/* Emergency Controls */}
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Emergency Controls</p>

                                    <button
                                        onClick={() => handleNodeAction(selectedNode)}
                                        className={`w-full flex items-center justify-between gap-4 p-4 rounded-3xl font-bold text-sm transition-all border ${selectedNode.status === 'isolated'
                                                ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700'
                                                : 'bg-red-600/10 border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {selectedNode.status === 'isolated' ? <Zap className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                                            <span>{selectedNode.status === 'isolated' ? 'RECONNECT TO MAIN GRID' : 'EMERGENCY ISOLATION'}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 shrink-0" />
                                    </button>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-bold text-xs hover:bg-white/10 hover:text-white transition-all">
                                            <Info className="w-4 h-4" />
                                            Log Readout
                                        </button>
                                        <button
                                            onClick={() => handleIoTDebug(selectedNode)}
                                            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-cyan-600/10 border border-cyan-600/30 text-cyan-400 font-bold text-xs hover:bg-cyan-600 hover:text-white transition-all"
                                        >
                                            <Cpu className="w-4 h-4" />
                                            IoT Debug
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="node-placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-slate-50 rounded-[2.5rem] border border-slate-100 h-[480px] flex flex-col items-center justify-center text-center p-8 group cursor-default"
                            >
                                <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                    <MapIcon className="w-10 h-10 text-slate-400" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-800 tracking-tight">Node Deployment Map</h4>
                                <p className="text-slate-500 text-sm mt-2 max-w-[200px]">
                                    Select a node on the live grid to initialize tactical readout and emergency controls.
                                </p>
                                <div className="mt-6 flex flex-col gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /> Active Node</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Isolated Node</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /> Fault Detected</div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Flow Monitoring Mini-Panel */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8">
                        <EnergyFlow flows={snapshot?.flows || []} nodes={snapshot?.nodes || []} />
                    </div>
                </div>
            </div>
        </div>
    )
}
