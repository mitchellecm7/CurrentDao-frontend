/**
 * Recommendation Panel Component
 * Displays AI trading recommendations with comprehensive risk assessment
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  Shield, 
  Target,
  Clock,
  BarChart3,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { TradingRecommendation, RiskAssessment, AIUserProfile } from '../../types/ai';
import { AIService } from '../../services/ai/ai-service';

interface RecommendationPanelProps {
  recommendation: TradingRecommendation | null;
  userProfile: AIUserProfile;
  onAccept?: () => void;
  onReject?: () => void;
  showRiskAssessment?: boolean;
  showExplainableFactors?: boolean;
  className?: string;
}

const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  recommendation,
  userProfile,
  onAccept,
  onReject,
  showRiskAssessment = true,
  showExplainableFactors = true,
  className = ''
}) => {
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const aiService = AIService.getInstance();

  useEffect(() => {
    if (recommendation && showRiskAssessment) {
      loadRiskAssessment();
    }
  }, [recommendation, showRiskAssessment]);

  const loadRiskAssessment = async () => {
    if (!recommendation) return;

    try {
      setLoading(true);
      const assessment = await aiService.assessRisk(recommendation, userProfile);
      setRiskAssessment(assessment);
    } catch (error) {
      console.error('Risk assessment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <TrendingUp className="text-green-500" />;
      case 'sell':
        return <TrendingDown className="text-red-500" />;
      case 'hold':
        return <Minus className="text-yellow-500" />;
      default:
        return <Info className="text-gray-500" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sell':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Shield className="text-green-600" />;
      case 'medium':
        return <AlertTriangle className="text-yellow-600" />;
      case 'high':
        return <XCircle className="text-red-600" />;
      default:
        return <Info className="text-gray-600" />;
    }
  };

  if (!recommendation) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
          <p>No recommendation available</p>
          <p className="text-sm mt-2">AI is analyzing market data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getActionIcon(recommendation.type)}
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {recommendation.type.toUpperCase()} {recommendation.asset}
              </h3>
              <p className="text-sm text-gray-600">
                Generated {recommendation.timestamp.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getConfidenceColor(recommendation.confidence)}`}>
              {Math.round(recommendation.confidence * 100)}%
            </div>
            <p className="text-xs text-gray-600">Confidence</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Target size={20} className="mx-auto mb-1 text-blue-600" />
            <div className="text-lg font-semibold">
              {recommendation.expectedReturn > 0 ? '+' : ''}{recommendation.expectedReturn.toFixed(2)}%
            </div>
            <p className="text-xs text-gray-600">Expected Return</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Clock size={20} className="mx-auto mb-1 text-purple-600" />
            <div className="text-lg font-semibold capitalize">{recommendation.timeHorizon}</div>
            <p className="text-xs text-gray-600">Time Horizon</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            {getRiskIcon(recommendation.riskLevel)}
            <div className="text-lg font-semibold capitalize">{recommendation.riskLevel}</div>
            <p className="text-xs text-gray-600">Risk Level</p>
          </div>
        </div>
      </div>

      {/* Reason and Explanation */}
      <div className="p-6 border-b">
        <h4 className="font-semibold text-gray-900 mb-2">Reasoning</h4>
        <p className="text-gray-700 mb-4">{recommendation.reason}</p>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onAccept}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
          >
            <CheckCircle size={16} />
            <span>Accept</span>
          </button>
          <button
            onClick={onReject}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
          >
            <XCircle size={16} />
            <span>Reject</span>
          </button>
        </div>
      </div>

      {/* Explainable Factors */}
      {showExplainableFactors && (
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Explainable Factors</h4>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          </div>

          <div className="space-y-3">
            {recommendation.explainableFactors.map((factor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-600">
                    {Math.round(factor.weight * 100)}%
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{factor.factor}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      factor.category === 'technical' ? 'bg-blue-100 text-blue-800' :
                      factor.category === 'fundamental' ? 'bg-green-100 text-green-800' :
                      factor.category === 'sentiment' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {factor.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{factor.description}</p>
                  <div className="mt-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Value:</span>
                      <span className="text-sm font-medium">{factor.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${factor.weight * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Market Conditions */}
          {recommendation.marketConditions.length > 0 && (
            <div className="mt-6">
              <h5 className="font-medium text-gray-900 mb-3">Market Conditions</h5>
              <div className="grid grid-cols-2 gap-3">
                {recommendation.marketConditions.map((condition, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{condition.indicator}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        condition.trend === 'bullish' ? 'bg-green-100 text-green-800' :
                        condition.trend === 'bearish' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {condition.trend}
                      </span>
                    </div>
                    <div className="text-lg font-semibold">{condition.value}</div>
                    <div className="text-xs text-gray-500">{condition.significance} significance</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Risk Assessment */}
      {showRiskAssessment && (
        <div className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Risk Assessment</h4>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Assessing risk...</p>
            </div>
          ) : riskAssessment ? (
            <div className="space-y-4">
              {/* Overall Risk */}
              <div className={`p-4 rounded-lg ${getRiskColor(riskAssessment.overallRisk)}`}>
                <div className="flex items-center space-x-3 mb-2">
                  {getRiskIcon(riskAssessment.overallRisk)}
                  <span className="font-semibold capitalize">{riskAssessment.overallRisk} Risk</span>
                </div>
                <p className="text-sm">{riskAssessment.recommendation}</p>
              </div>

              {/* Risk Factors */}
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Risk Factors</h5>
                <div className="space-y-2">
                  {riskAssessment.factors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{factor.factor}</span>
                        <p className="text-sm text-gray-600">{factor.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">{Math.round(factor.level * 100)}%</div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          factor.impact === 'high' ? 'bg-red-100 text-red-800' :
                          factor.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {factor.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mitigation Strategies */}
              {riskAssessment.mitigation.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Risk Mitigation</h5>
                  <ul className="space-y-2">
                    {riskAssessment.mitigation.map((strategy, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <AlertTriangle size={32} className="mx-auto mb-2 opacity-50" />
              <p>Risk assessment unavailable</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default RecommendationPanel;
