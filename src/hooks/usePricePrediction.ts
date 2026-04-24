import { useState, useEffect, useCallback, useMemo } from 'react';
import AIModels from '../services/prediction/ai-models';
import EnsembleMethods from '../services/prediction/ensemble-methods';
import AccuracyTracker from '../utils/prediction/accuracy-tracking';

interface PredictionState {
  currentPrediction: any;
  ensemblePrediction: any;
  individualPredictions: any[];
  isLoading: boolean;
  error: string | null;
  selectedTimeframe: string;
  selectedEnsemble: string;
  selectedModels: string[];
  customFeatures: any;
  accuracyMetrics: any;
  alerts: string[];
}

interface PredictionConfig {
  timeframe: string;
  ensembleMethod: string;
  models: string[];
  customIndicators: any;
  confidenceThreshold: number;
  autoRetrain: boolean;
  realTimeUpdates: boolean;
}

const usePricePrediction = (initialConfig?: Partial<PredictionConfig>) => {
  const [state, setState] = useState<PredictionState>({
    currentPrediction: null,
    ensemblePrediction: null,
    individualPredictions: [],
    isLoading: false,
    error: null,
    selectedTimeframe: initialConfig?.timeframe || '1hour',
    selectedEnsemble: initialConfig?.ensembleMethod || 'default',
    selectedModels: initialConfig?.models || ['lstm', 'random_forest', 'gradient_boosting'],
    customFeatures: initialConfig?.customIndicators || {},
    accuracyMetrics: null,
    alerts: []
  });

  // Initialize services
  const aiModels = useMemo(() => new AIModels(), []);
  const ensembleMethods = useMemo(() => new EnsembleMethods(aiModels), [aiModels]);
  const accuracyTracker = useMemo(() => new AccuracyTracker(), []);

  // Load initial data
  useEffect(() => {
    initializeModels();
    loadAccuracyMetrics();
    loadAlerts();
  }, []);

  const initializeModels = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const availableModels = aiModels.getAvailableModels();
      const untrainedModels = availableModels.filter(model => !aiModels.isModelTrained(model));
      
      // Train untrained models
      const trainingPromises = untrainedModels.map(model => aiModels.trainModel(model));
      await Promise.all(trainingPromises);
      
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to initialize models' 
      }));
    }
  }, [aiModels]);

  const loadAccuracyMetrics = useCallback(() => {
    const metrics = accuracyTracker.getAllMetrics();
    setState(prev => ({ ...prev, accuracyMetrics: metrics }));
  }, [accuracyTracker]);

  const loadAlerts = useCallback(() => {
    const alerts = accuracyTracker.getAlerts(10);
    setState(prev => ({ ...prev, alerts }));
  }, [accuracyTracker]);

  const generatePrediction = useCallback(async (
    timeframe?: string,
    ensembleMethod?: string,
    models?: string[],
    customFeatures?: any
  ) => {
    const selectedTimeframe = timeframe || state.selectedTimeframe;
    const selectedEnsemble = ensembleMethod || state.selectedEnsemble;
    const selectedModels = models || state.selectedModels;
    const features = customFeatures || state.customFeatures;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Generate individual model predictions
      const individualPredictions: any[] = [];
      
      for (const modelType of selectedModels) {
        if (aiModels.isModelTrained(modelType)) {
          try {
            const prediction = await aiModels.predict(modelType, selectedTimeframe, features);
            individualPredictions.push(prediction);
          } catch (error) {
            console.warn(`Failed to get prediction from ${modelType}:`, error);
          }
        }
      }

      // Generate ensemble prediction
      const ensemblePrediction = await ensembleMethods.predict(selectedEnsemble, selectedTimeframe, features);

      // Record predictions for accuracy tracking
      individualPredictions.forEach(prediction => {
        accuracyTracker.recordPrediction({
          modelType: prediction.modelType,
          predictedPrice: prediction.predictedPrice,
          confidence: prediction.confidence,
          upperBound: prediction.upperBound,
          lowerBound: prediction.lowerBound,
          timeframe: selectedTimeframe,
          features: prediction.features
        });
      });

      accuracyTracker.recordPrediction({
        modelType: 'ensemble',
        ensembleMethod: selectedEnsemble,
        predictedPrice: ensemblePrediction.predictedPrice,
        confidence: ensemblePrediction.confidence,
        upperBound: ensemblePrediction.upperBound,
        lowerBound: ensemblePrediction.lowerBound,
        timeframe: selectedTimeframe,
        features: {}
      });

      setState(prev => ({
        ...prev,
        currentPrediction: ensemblePrediction,
        ensemblePrediction,
        individualPredictions,
        isLoading: false,
        selectedTimeframe,
        selectedEnsemble,
        selectedModels,
        customFeatures: features
      }));

      loadAccuracyMetrics();
      loadAlerts();

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate prediction'
      }));
    }
  }, [state.selectedTimeframe, state.selectedEnsemble, state.selectedModels, state.customFeatures, aiModels, ensembleMethods, accuracyTracker, loadAccuracyMetrics, loadAlerts]);

  const updateActualPrice = useCallback((predictionId: string, actualPrice: number) => {
    accuracyTracker.updateActualPrice(predictionId, actualPrice);
    loadAccuracyMetrics();
  }, [accuracyTracker, loadAccuracyMetrics]);

  const setTimeframe = useCallback((timeframe: string) => {
    setState(prev => ({ ...prev, selectedTimeframe: timeframe }));
  }, []);

  const setEnsembleMethod = useCallback((ensembleMethod: string) => {
    setState(prev => ({ ...prev, selectedEnsemble: ensembleMethod }));
  }, []);

  const setSelectedModels = useCallback((models: string[]) => {
    setState(prev => ({ ...prev, selectedModels: models }));
  }, []);

  const setCustomFeatures = useCallback((features: any) => {
    setState(prev => ({ ...prev, customFeatures: features }));
  }, []);

  const retrainModel = useCallback(async (modelType: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await aiModels.trainModel(modelType);
      setState(prev => ({ ...prev, isLoading: false }));
      
      // Generate new prediction after retraining
      generatePrediction();
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to retrain model'
      }));
    }
  }, [aiModels, generatePrediction]);

  const retrainAllModels = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const results = await aiModels.retrainAllModels();
      setState(prev => ({ ...prev, isLoading: false }));
      
      // Generate new prediction after retraining
      generatePrediction();
      
      return results;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to retrain models'
      }));
      return [];
    }
  }, [aiModels, generatePrediction]);

  const getModelMetrics = useCallback((modelType: string) => {
    return aiModels.getModelMetrics(modelType);
  }, [aiModels]);

  const getEnsembleMetrics = useCallback((ensembleName: string) => {
    return ensembleMethods.getEnsembleMetrics(ensembleName);
  }, [ensembleMethods]);

  const getAccuracyMetrics = useCallback((modelType: string, timeframe: string) => {
    return accuracyTracker.getMetrics(modelType, timeframe);
  }, [accuracyTracker]);

  const getPerformanceReport = useCallback((modelType: string, timeframe: string, period: 'daily' | 'weekly' | 'monthly') => {
    return accuracyTracker.getPerformanceReport(modelType, timeframe, period);
  }, [accuracyTracker]);

  const getTopPerformingModels = useCallback((limit: number = 10) => {
    return accuracyTracker.getTopPerformingModels(limit);
  }, [accuracyTracker]);

  const getModelComparison = useCallback((timeframe: string) => {
    return accuracyTracker.getModelComparison(timeframe);
  }, [accuracyTracker]);

  const getAccuracyTrend = useCallback((modelType: string, timeframe: string, days: number = 30) => {
    return accuracyTracker.getAccuracyTrend(modelType, timeframe, days);
  }, [accuracyTracker]);

  const getConfidenceIntervalAccuracy = useCallback((modelType: string, timeframe: string) => {
    return accuracyTracker.getConfidenceIntervalAccuracy(modelType, timeframe);
  }, [accuracyTracker]);

  const getModelFeatureImportance = useCallback((modelType: string) => {
    return aiModels.getModelFeatureImportance(modelType);
  }, [aiModels]);

  const getAvailableModels = useCallback(() => {
    return aiModels.getAvailableModels();
  }, [aiModels]);

  const getAvailableEnsembles = useCallback(() => {
    return ensembleMethods.getAvailableEnsembles();
  }, [ensembleMethods]);

  const getEnsembleConfig = useCallback((ensembleName: string) => {
    return ensembleMethods.getEnsembleConfig(ensembleName);
  }, [ensembleMethods]);

  const updateEnsembleConfig = useCallback((ensembleName: string, config: any) => {
    ensembleMethods.updateEnsembleConfig(ensembleName, config);
  }, [ensembleMethods]);

  const clearAlerts = useCallback(() => {
    accuracyTracker.clearAlerts();
    loadAlerts();
  }, [accuracyTracker, loadAlerts]);

  const exportData = useCallback(() => {
    return accuracyTracker.exportMetrics();
  }, [accuracyTracker]);

  const importData = useCallback((data: any) => {
    accuracyTracker.importMetrics(data);
    loadAccuracyMetrics();
  }, [accuracyTracker, loadAccuracyMetrics]);

  const getPredictionHistory = useCallback((limit: number = 100) => {
    return ensembleMethods.getPredictionHistory(limit);
  }, [ensembleMethods]);

  const getSummaryStats = useCallback(() => {
    return accuracyTracker.getSummaryStats();
  }, [accuracyTracker]);

  // Auto-refresh predictions
  useEffect(() => {
    if (initialConfig?.realTimeUpdates && state.currentPrediction) {
      const interval = setInterval(() => {
        generatePrediction();
      }, 60000); // Refresh every minute

      return () => clearInterval(interval);
    }
  }, [initialConfig?.realTimeUpdates, state.currentPrediction, generatePrediction]);

  // Auto-retrain if accuracy drops below threshold
  useEffect(() => {
    if (initialConfig?.autoRetrain && state.accuracyMetrics) {
      const checkAccuracy = () => {
        state.accuracyMetrics.forEach((metrics: any, key: string) => {
          const [modelType] = key.split('-');
          const threshold = 0.80; // 80% accuracy threshold
          
          if (metrics.accuracy < threshold) {
            console.warn(`Model ${modelType} accuracy dropped to ${metrics.accuracy}, considering retraining`);
            // Optional: Auto-retrain logic here
          }
        });
      };

      const interval = setInterval(checkAccuracy, 300000); // Check every 5 minutes
      return () => clearInterval(interval);
    }
  }, [initialConfig?.autoRetrain, state.accuracyMetrics]);

  return {
    // State
    currentPrediction: state.currentPrediction,
    ensemblePrediction: state.ensemblePrediction,
    individualPredictions: state.individualPredictions,
    isLoading: state.isLoading,
    error: state.error,
    selectedTimeframe: state.selectedTimeframe,
    selectedEnsemble: state.selectedEnsemble,
    selectedModels: state.selectedModels,
    customFeatures: state.customFeatures,
    accuracyMetrics: state.accuracyMetrics,
    alerts: state.alerts,

    // Actions
    generatePrediction,
    updateActualPrice,
    setTimeframe,
    setEnsembleMethod,
    setSelectedModels,
    setCustomFeatures,
    retrainModel,
    retrainAllModels,
    clearAlerts,

    // Data accessors
    getModelMetrics,
    getEnsembleMetrics,
    getAccuracyMetrics,
    getPerformanceReport,
    getTopPerformingModels,
    getModelComparison,
    getAccuracyTrend,
    getConfidenceIntervalAccuracy,
    getModelFeatureImportance,
    getAvailableModels,
    getAvailableEnsembles,
    getEnsembleConfig,
    updateEnsembleConfig,
    getPredictionHistory,
    getSummaryStats,
    exportData,
    importData,

    // Services (for advanced usage)
    aiModels,
    ensembleMethods,
    accuracyTracker
  };
};

export default usePricePrediction;
