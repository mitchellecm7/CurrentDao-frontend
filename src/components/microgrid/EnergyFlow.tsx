'use client'

import { motion } from 'framer-motion'
import { Zap, ArrowRightLeft, AlertTriangle } from 'lucide-react'
import { EnergyFlow as EnergyFlowType, GridNode } from '@/types/microgrid'

interface EnergyFlowProps {
    flows: EnergyFlowType[]
    nodes: GridNode[]
    showDetails?: boolean
}

export function EnergyFlow({ flows, nodes, showDetails = true }: EnergyFlowProps) {
    const getNodeName = (id: string) => nodes.find(n => n.id === id)?.name || 'Unknown'

    return (
        <div className="space-y-4">
            {showDetails && (
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Live Energy Flows
                    </h3>
                    <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full animate-pulse">
                        LIVE UPDATING
                    </span>
                </div>
            )}

            <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {flows.map((flow) => {
                    const isCritical = flow.status === 'critical'

                    return (
                        <motion.div
                            key={flow.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-4 transition-colors ${isCritical
                                    ? 'bg-red-50 border-red-200 shadow-sm'
                                    : 'bg-white border-slate-100 hover:border-blue-200'
                                }`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-100' : 'bg-blue-50'}`}>
                                    {isCritical ? (
                                        <AlertTriangle className="w-4 h-4 text-red-600" />
                                    ) : (
                                        <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <span className="truncate max-w-[80px]">{getNodeName(flow.fromNodeId)}</span>
                                        <motion.div
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        >
                                            <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                                        </motion.div>
                                        <span className="truncate max-w-[80px]">{getNodeName(flow.toNodeId)}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">
                                        {flow.sourceType} • {flow.status}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right shrink-0">
                                <span className={`text-sm font-bold ${isCritical ? 'text-red-700' : 'text-slate-900'}`}>
                                    {flow.amount.toFixed(1)} kW
                                </span>
                                <div className="mt-1 w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full ${isCritical ? 'bg-red-500' : 'bg-blue-500'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (flow.amount / 200) * 100)}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
        </div>
    )
}
