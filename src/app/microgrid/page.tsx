'use client'

import { GridVisualization } from '@/components/microgrid/GridVisualization'
import { motion } from 'framer-motion'
export default function MicrogridPage() {
    return (
        <div className="space-y-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <GridVisualization />
            </motion.div>

            {/* Info Section */}
            <section className="mt-24 grid md:grid-cols-3 gap-12 border-t border-slate-200 pt-16 pb-24">
                <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-4">Tactical Grid Control</h4>
                    <p className="text-slate-600 leading-relaxed">
                        The Microgrid Commander provides granular control over 1000+ connection points.
                        Using advanced IoT integration, operators can isolate individual nodes or sub-grids
                        during emergencies, ensuring local stability even during wider grid failures.
                    </p>
                </div>
                <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-4">P2P Energy Marketplace</h4>
                    <p className="text-slate-600 leading-relaxed">
                        Visualize real-time energy exchanges between community members. Our smart contract-secured
                        trading layer allows prosumers to sell excess solar and wind energy directly to neighbors,
                        reducing transmission losses and lowering local energy costs.
                    </p>
                </div>
                <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-4">Community Intelligence</h4>
                    <p className="text-slate-600 leading-relaxed">
                        Comprehensive analytics track community-wide self-sufficiency, renewable adoption,
                        and carbon offsets. Access 6-month historical performance data to optimize local production
                        and storage strategies for a sustainable future.
                    </p>
                </div>
            </section>
        </div>
    )
}
