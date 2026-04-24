'use client'

import { motion } from 'framer-motion'
import { BarChart3, PieChart, TrendingUp, Zap, Sun, Wind, Battery, CloudLightning } from 'lucide-react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'
import { CommunityAnalytics as CommunityAnalyticsType } from '@/types/microgrid'

interface CommunityAnalyticsProps {
    analytics: CommunityAnalyticsType | null
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6366f1'];

export function CommunityAnalytics({ analytics }: CommunityAnalyticsProps) {
    if (!analytics) return (
        <div className="animate-pulse flex flex-col items-center justify-center h-48 bg-slate-50 rounded-2xl border border-slate-100">
            <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Compiling Analytics Data...</p>
        </div>
    )

    const stats = [
        { label: 'Self Sufficiency', value: `${analytics.dailySelfSufficiency.toFixed(1)}%`, icon: Sun, color: 'text-yellow-500' },
        { label: 'Renewable Share', value: `${analytics.dailyRenewableShare.toFixed(1)}%`, icon: Wind, color: 'text-emerald-500' },
        { label: 'Carbon Saved', value: `${analytics.totalCarbonSaved.toFixed(0)} kg`, icon: LeafIcon, color: 'text-green-500' },
        { label: 'P2P Volume', value: `${analytics.p2pTradingVolume.toFixed(0)} kWh`, icon: Zap, color: 'text-blue-500' },
    ]

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 flex flex-col items-center text-center group hover:bg-white hover:shadow-md transition-all cursor-pointer"
                    >
                        <div className={`p-2 rounded-xl bg-white mb-2 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
                <div className="p-6 rounded-2xl bg-white border border-slate-100/50 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">6-Month Load vs Production</h4>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span>Load</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span>Prod</span></div>
                        </div>
                    </div>

                    <div className="h-[250px] w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={(() => {
                                // Sample 180 days down to ~30 points for readability
                                const raw = analytics.historicalLoad.map((item, i) => ({
                                    time: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                    load: item.value,
                                    production: analytics.historicalProduction[i]?.value || 0
                                }))
                                const step = Math.max(1, Math.floor(raw.length / 30))
                                return raw.filter((_, i) => i % step === 0)
                            })()}>
                                <defs>
                                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                />
                                <Area type="monotone" dataKey="load" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" />
                                <Area type="monotone" dataKey="production" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProd)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-100/50 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <PieChart className="w-5 h-5 text-emerald-500" />
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Source Distribution</h4>
                    </div>

                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    data={analytics.sourceDistribution}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {analytics.sourceDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    align="center"
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold', paddingTop: '20px' }}
                                />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}

function LeafIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.22 4.93c.2.05.4.15.53.33.13.17.25.42.25.74 0 4.38-4.62 9.01-9 14Z" />
            <path d="M11 20c-1.5 0-3-1-3.9-2.27" />
            <path d="M14 11.5c2.5 0 5 1.5 5 1.5" />
        </svg>
    )
}
