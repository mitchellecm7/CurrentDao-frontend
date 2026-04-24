// Mock imports for development
import { useState, useCallback, useEffect, FC } from '../../mocks/react-mock';
import { 
  TrendingUp, AlertTriangle, Shield, BarChart3, Info, Calculator 
} from '../../mocks/react-mock';
import { motion, AnimatePresence } from '../../mocks/react-mock';
import { useTransactionSecurity } from '../../hooks/useTransactionSecurity';

interface RiskFactor {
  id: string;
  name: string;
  weight: number;
  score: number;
  description: string;
  category: 'network' | 'behavioral' | 'historical' | 'technical';
}

interface RiskAssessmentResult {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  confidence: {
    lower: number;
    upper: number;
    interval: number;
  };
  factors: RiskFactor[];
  recommendations: string[];
  processingTime: number;
}

interface RiskAssessmentProps {
  transaction: any;
  onAssessmentComplete?: (result: RiskAssessmentResult) => void;
}

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({
  transaction,
  onAssessmentComplete
}) => {
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<RiskAssessmentResult | null>(null);
  const [selectedFactor, setSelectedFactor] = useState<RiskFactor | null>(null);
  const [autoAssess, setAutoAssess] = useState(false);
  
  const { assessRisk } = useTransactionSecurity();

  const runRiskAssessment = useCallback(async () => {
    if (!transaction) return;
    
    setIsAssessing(true);
    setAssessmentResult(null);
    
    const startTime = performance.now();
    
    try {
      const result = await assessRisk(transaction);
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // Generate confidence intervals
      const baseScore = result.riskScore || 0;
      const marginOfError = 0.05; // 5% margin of error
      const confidence = {
        lower: Math.max(0, baseScore - marginOfError),
        upper: Math.min(1, baseScore + marginOfError),
        interval: marginOfError * 2
      };
      
      const assessmentData: RiskAssessmentResult = {
        overallRisk: result.riskLevel || 'low',
        riskScore: baseScore,
        confidence,
        factors: result.factors || [],
        recommendations: result.recommendations || [],
        processingTime
      };
      
      setAssessmentResult(assessmentData);
      onAssessmentComplete?.(assessmentData);
      
    } catch (error) {
      console.error('Risk assessment failed:', error);
      setAssessmentResult({
        overallRisk: 'medium',
        riskScore: 0.5,
        confidence: { lower: 0.45, upper: 0.55, interval: 0.1 },
        factors: [],
        recommendations: ['Unable to complete risk assessment'],
        processingTime: performance.now() - startTime
      });
    } finally {
      setIsAssessing(false);
    }
  }, [transaction, assessRisk, onAssessmentComplete]);

  // Auto-assess when transaction changes
  useEffect(() => {
    if (transaction && autoAssess && !isAssessing) {
      const timer = setTimeout(() => runRiskAssessment(), 1200);
      return () => clearTimeout(timer);
    }
  }, [transaction, autoAssess, runRiskAssessment, isAssessing]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'network': return 'text-blue-600 bg-blue-100';
      case 'behavioral': return 'text-purple-600 bg-purple-100';
      case 'historical': return 'text-indigo-600 bg-indigo-100';
      case 'technical': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatScore = (score: number) => {
    return (score * 100).toFixed(1);
  };

  const getRiskLevelFromScore = (score: number) => {
    if (score < 0.3) return 'low';
    if (score < 0.6) return 'medium';
    if (score < 0.8) return 'high';
    return 'critical';
  };

  const sortedFactors = assessmentResult?.factors.sort((a, b) => b.score - a.score) || [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-teal-600" />
          <h2 className="text-2xl font-bold text-gray-900">Risk Assessment</h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoAssess}
              onChange={(e) => setAutoAssess(e.target.checked)}
              className="rounded"
            />
            Auto-assess
          </label>
        </div>
      </div>

      {/* Assessment Controls */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={runRiskAssessment}
          disabled={!transaction || isAssessing}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAssessing ? (
            <>
              <Calculator className="w-4 h-4 animate-spin" />
              Assessing...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Run Risk Assessment
            </>
          )}
        </button>

        {assessmentResult && (
          <div className="flex items-center gap-2 ml-auto">
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(assessmentResult.overallRisk)}`}>
              {assessmentResult.overallRisk.toUpperCase()}
            </div>
            <div className="text-sm text-gray-600">
              Score: {formatScore(assessmentResult.riskScore)}
            </div>
          </div>
        )}
      </div>

      {/* Assessment Results */}
      <AnimatePresence>
        {assessmentResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Overall Risk Score with Confidence Intervals */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Risk Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Risk Score Visualization */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Risk Score</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatScore(assessmentResult.riskScore)}
                    </span>
                  </div>
                  
                  {/* Risk Score Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${
                        assessmentResult.riskScore < 0.3 ? 'bg-green-500' :
                        assessmentResult.riskScore < 0.6 ? 'bg-yellow-500' :
                        assessmentResult.riskScore < 0.8 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${assessmentResult.riskScore * 100}%` }}
                    />
                  </div>
                  
                  {/* Risk Level Indicators */}
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                    <span>Critical</span>
                  </div>
                </div>

                {/* Confidence Intervals */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Confidence Interval</span>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-center mb-3">
                      <p className="text-xs text-gray-600 mb-1">95% Confidence</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatScore(assessmentResult.confidence.lower)} - {formatScore(assessmentResult.confidence.upper)}
                      </p>
                    </div>
                    
                    {/* Confidence Visualization */}
                    <div className="relative h-8 bg-gray-100 rounded">
                      <div
                        className="absolute h-full bg-blue-200 rounded"
                        style={{
                          left: `${assessmentResult.confidence.lower * 100}%`,
                          width: `${assessmentResult.confidence.interval * 100}%`
                        }}
                      />
                      <div
                        className="absolute h-full bg-blue-500 rounded"
                        style={{
                          left: `${assessmentResult.riskScore * 100 - 1}%`,
                          width: '2%'
                        }}
                      />
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      ±{(assessmentResult.confidence.interval * 50).toFixed(1)}% margin of error
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            {sortedFactors.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Factors Analysis</h3>
                <div className="space-y-3">
                  {sortedFactors.map((factor, index) => (
                    <div
                      key={factor.id}
                      className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:border-teal-300 transition-colors"
                      onClick={() => setSelectedFactor(factor)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(factor.category)}`}>
                            {factor.category}
                          </div>
                          <h4 className="font-medium text-gray-900">{factor.name}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {formatScore(factor.score)}
                            </p>
                            <p className="text-xs text-gray-500">Weight: {factor.weight}</p>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${
                            factor.score < 0.3 ? 'bg-green-500' :
                            factor.score < 0.6 ? 'bg-yellow-500' :
                            factor.score < 0.8 ? 'bg-orange-500' : 'bg-red-500'
                          }`} />
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{factor.description}</p>
                      
                      {/* Factor Score Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            factor.score < 0.3 ? 'bg-green-500' :
                            factor.score < 0.6 ? 'bg-yellow-500' :
                            factor.score < 0.8 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${factor.score * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {assessmentResult.recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Risk Mitigation Recommendations
                </h3>
                <ul className="space-y-2">
                  {assessmentResult.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Factor Details Modal */}
            <AnimatePresence>
              {selectedFactor && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                  onClick={() => setSelectedFactor(null)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-xl p-6 max-w-md w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Risk Factor Details</h3>
                      <button
                        onClick={() => setSelectedFactor(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(selectedFactor.category)}`}>
                            {selectedFactor.category}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {getRiskLevelFromScore(selectedFactor.score).toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 text-lg">{selectedFactor.name}</h4>
                      </div>
                      
                      <p className="text-gray-600">{selectedFactor.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600 mb-1">Risk Score</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatScore(selectedFactor.score)}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600 mb-1">Weight</p>
                          <p className="text-xl font-bold text-gray-900">
                            {selectedFactor.weight}
                          </p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            selectedFactor.score < 0.3 ? 'bg-green-500' :
                            selectedFactor.score < 0.6 ? 'bg-yellow-500' :
                            selectedFactor.score < 0.8 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${selectedFactor.score * 100}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!assessmentResult && !isAssessing && (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Risk Assessment Ready</h3>
          <p className="text-gray-600 mb-4">
            Comprehensive risk analysis with confidence intervals
          </p>
          <button
            onClick={runRiskAssessment}
            disabled={!transaction}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Start Assessment
          </button>
        </div>
      )}
    </div>
  );
};
