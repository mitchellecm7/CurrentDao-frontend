'use client'

import { motion } from 'framer-motion'
import {
    Zap,
    Battery,
    Wind,
    Sun,
    Activity,
    Radio,
    ShieldAlert,
    Droplets
} from 'lucide-react'
import { GridStatus as GridStatusType } from '@/types/microgrid'

interface GridStatusProps {
    status: GridStatusType | null
}

export function GridStatus({ status }: GridStatusProps) {
    if (!status) return (
        <div className="animate-pulse flex flex-col items-center justify-center h-48 bg-slate-50 rounded-2xl border border-slate-100">
            <Activity className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Awaiting Grid Sync...</p>
        </div>
    )

    const metrics = [
        { label: 'Total Load', value: `${(status.totalLoad / 1000).toFixed(2)} MW`, icon: Activity, color: 'text-blue-500', bgColor: 'bg-blue-100' },
        { label: 'Production', value: `${(status.totalProduction / 1000).toFixed(2)} MW`, icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
        { label: 'Grid Frequency', value: `${status.frequency.toFixed(2)} Hz`, icon: Radio, color: 'text-purple-500', bgColor: 'bg-purple-100' },
        { label: 'Carbon Intensity', value: `${status.carbonIntensity.toFixed(0)} g/kWh`, icon: Droplets, color: 'text-emerald-500', bgColor: 'bg-emerald-100' },
    ]

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map((metric, index) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-2xl border border-slate-100/50 bg-white/50 hover:bg-white hover:shadow-sm transition-all text-center"
                    >
                        <div className={`w-10 h-10 ${metric.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                            <metric.icon className={`w-5 h-5 ${metric.color}`} />
                        </div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{metric.label}</p>
                        <p className="text-xl font-bold text-slate-900">{metric.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div className="p-5 rounded-2xl border border-slate-100/50 bg-gradient-to-br from-slate-50 to-white">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Battery className="w-5 h-5 text-emerald-500" />
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Storage Reserve</h4>
                        </div>
                        <span className="text-lg font-bold text-emerald-600">{status.storageLevel.toFixed(1)}%</span>
                    </div>

                    <div className="relative w-full h-4 bg-slate-200 rounded-full overflow-hidden mb-4">
                        <motion.div
                            className={`h-full ${status.storageLevel > 20 ? 'bg-emerald-500' : 'bg-red-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${status.storageLevel}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>

                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Available: {(status.storageCapacity * (status.storageLevel / 100)).toFixed(0)} kWh</span>
                        </div>
                        <div>Total: {status.storageCapacity.toFixed(0)} kWh</div>
                    </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-100/50 bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
                    <div className="text-center">
                        <div className="relative inline-block mb-3">
                            <div className={`w-16 h-16 rounded-full ${status.systemHealth > 90 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'} flex items-center justify-center border-4 border-white shadow-sm`}>
                                {status.systemHealth > 90 ? (
                                    <Activity className="w-8 h-8" />
                                ) : (
                                    <ShieldAlert className="w-8 h-8" />
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg border border-slate-100">
                                <div className={`w-3.5 h-3.5 rounded-full ${status.activeAlarms > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                            </div>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">System Health</p>
                        <p className={`text-2xl font-black ${status.systemHealth > 90 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {status.systemHealth.toFixed(1)}%
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                            {status.onlineNodes} / {status.totalNodes} Nodes Online
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
