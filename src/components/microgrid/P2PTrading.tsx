'use client'

import { motion } from 'framer-motion'
import { TrendingUp, User, ShoppingCart, CheckCircle2, DollarSign } from 'lucide-react'
import { P2PTrade, GridNode } from '@/types/microgrid'

interface P2PTradingProps {
    trades: P2PTrade[]
    nodes: GridNode[]
}

export function P2PTrading({ trades, nodes }: P2PTradingProps) {
    const getNodeName = (id: string) => nodes.find(n => n.id === id)?.name || 'Unknown'

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    P2P Trading Activity
                </h3>
                <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                    SMART CONTRACT SECURED
                </span>
            </div>

            <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                {trades.map((trade) => (
                    <motion.div
                        key={trade.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-slate-50 group-hover:border-white">
                                        <User className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-slate-50 group-hover:border-white">
                                        <ShoppingCart className="w-4 h-4 text-emerald-600" />
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                                        <span className="truncate max-w-[80px]">{getNodeName(trade.sellerId)}</span>
                                        <span className="text-slate-400 font-normal">→</span>
                                        <span className="truncate max-w-[80px]">{getNodeName(trade.buyerId)}</span>
                                    </p>
                                    <p className="text-xs text-slate-500">{new Date(trade.timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    <span>${(trade.energyAmount * trade.price).toFixed(2)}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">SETTLED P2P</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-3 px-1">
                            <div className="bg-white/60 p-2 rounded-xl border border-slate-100/50">
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Energy</p>
                                <div className="flex items-center gap-1.5">
                                    <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="text-sm font-bold text-slate-800">{trade.energyAmount.toFixed(1)} kWh</span>
                                </div>
                            </div>
                            <div className="bg-white/60 p-2 rounded-xl border border-slate-100/50">
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Rate</p>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-sm font-bold text-slate-800">${trade.price.toFixed(3)}/kWh</span>
                                </div>
                            </div>
                        </div>

                        {trade.transactionHash && (
                            <div className="mt-3 pt-3 border-t border-slate-100/50 flex items-center justify-between">
                                <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">{trade.transactionHash}</span>
                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 uppercase tracking-wider">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Verified
                                </span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
