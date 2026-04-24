import React from 'react';
import { motion } from 'framer-motion';
import { Beaker, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ABTestResult } from '@/types/pricing';

interface ABTestingProps {
  tests: ABTestResult[];
}

export const ABTesting: React.FC<ABTestingProps> = ({ tests }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Beaker className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">A/B Testing Experiments</h3>
      </div>

      <div className="space-y-6">
        {tests.map((test) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-100 rounded-lg p-4 bg-gray-50"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{test.testName}</h4>
                <p className="text-sm text-gray-500">
                  Started {new Date(test.startDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                <TrendingUp className="w-3 h-3" />
                {(test.statisticalSignificance * 100).toFixed(1)}% Sig.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg border ${test.winner === 'A' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-400">VARIANT A</span>
                  {test.winner === 'A' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                </div>
                <div className="text-xl font-bold text-gray-900">${test.variantA.price.toFixed(2)}</div>
                <div className="text-sm text-gray-500">${test.variantA.revenue.toLocaleString()} Revenue</div>
              </div>

              <div className={`p-3 rounded-lg border ${test.winner === 'B' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-400">VARIANT B</span>
                  {test.winner === 'B' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                </div>
                <div className="text-xl font-bold text-gray-900">${test.variantB.price.toFixed(2)}</div>
                <div className="text-sm text-gray-500">${test.variantB.revenue.toLocaleString()} Revenue</div>
              </div>
            </div>

            {test.statisticalSignificance < 0.9 && (
              <div className="mt-4 flex items-center gap-2 text-amber-600 text-xs bg-amber-50 p-2 rounded">
                <AlertCircle className="w-4 h-4" />
                Results are not yet statistically significant. Continue testing.
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
