interface PredictionRecord {
  id: string;
  modelType: string;
  ensembleMethod?: string;
  predictedPrice: number;
  actualPrice?: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
  timestamp: Date;
  timeframe: string;
  features: any;
  accuracy?: number;
  error?: number;
  withinConfidence?: boolean;
}

interface AccuracyMetrics {
  modelType: string;
  timeframe: string;
  totalPredictions: number;
  accuratePredictions: number;
  accuracy: number;
  meanAbsoluteError: number;
  meanSquaredError: number;
  rootMeanSquaredError: number;
  meanAbsolutePercentageError: number;
  confidenceAccuracy: number;
  lastUpdated: Date;
  trend: 'improving' | 'declining' | 'stable';
  recentAccuracy: number;
  longTermAccuracy: number;
}

interface PerformanceReport {
  modelType: string;
  timeframe: string;
  period: 'daily' | 'weekly' | 'monthly';
  accuracy: number;
  error: number;
  confidence: number;
  predictions: number;
  improvement: number;
  ranking: number;
  recommendations: string[];
}

interface AccuracyThreshold {
  warning: number;
  critical: number;
  retrainThreshold: number;
}

class AccuracyTracker {
  private predictions: PredictionRecord[] = [];
  private metrics: Map<string, AccuracyMetrics> = new Map();
  private thresholds: Map<string, AccuracyThreshold> = new Map();
  private alerts: string[] = [];

  constructor() {
    this.initializeThresholds();
    this.loadHistoricalData();
  }

  private initializeThresholds() {
    // Set accuracy thresholds for different models
    this.thresholds.set('lstm', { warning: 0.85, critical: 0.80, retrainThreshold: 0.75 });
    this.thresholds.set('random_forest', { warning: 0.83, critical: 0.78, retrainThreshold: 0.73 });
    this.thresholds.set('gradient_boosting', { warning: 0.84, critical: 0.79, retrainThreshold: 0.74 });
    this.thresholds.set('neural_network', { warning: 0.86, critical: 0.81, retrainThreshold: 0.76 });
    this.thresholds.set('arima', { warning: 0.82, critical: 0.77, retrainThreshold: 0.72 });
    
    // Ensemble thresholds
    this.thresholds.set('weighted_average', { warning: 0.88, critical: 0.83, retrainThreshold: 0.78 });
    this.thresholds.set('stacking', { warning: 0.89, critical: 0.84, retrainThreshold: 0.79 });
    this.thresholds.set('bagging', { warning: 0.87, critical: 0.82, retrainThreshold: 0.77 });
    this.thresholds.set('boosting', { warning: 0.88, critical: 0.83, retrainThreshold: 0.78 });
    this.thresholds.set('voting', { warning: 0.86, critical: 0.81, retrainThreshold: 0.76 });
  }

  private loadHistoricalData() {
    // Generate mock historical prediction data
    const now = new Date();
    const models = ['lstm', 'random_forest', 'gradient_boosting', 'neural_network', 'arima'];
    const timeframes = ['1min', '5min', '15min', '30min', '1hour', '4hour', '1day'];
    
    for (let i = 1000; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60000); // 1-minute intervals
      
      models.forEach(modelType => {
        timeframes.forEach(timeframe => {
          if (Math.random() > 0.7) { // 30% chance of having actual price
            const predictedPrice = 100 + (Math.random() - 0.5) * 10;
            const actualPrice = predictedPrice + (Math.random() - 0.5) * 2;
            const confidence = 0.8 + Math.random() * 0.15;
            const error = Math.abs(actualPrice - predictedPrice) / actualPrice;
            const accuracy = Math.max(0, 1 - error);
            
            const prediction: PredictionRecord = {
              id: `${modelType}-${timeframe}-${i}`,
              modelType,
              predictedPrice,
              actualPrice,
              confidence,
              upperBound: predictedPrice + (1 - confidence) * predictedPrice * 2,
              lowerBound: predictedPrice - (1 - confidence) * predictedPrice * 2,
              timestamp,
              timeframe,
              features: {},
              accuracy,
              error,
              withinConfidence: actualPrice >= predictedPrice - (1 - confidence) * predictedPrice * 2 &&
                              actualPrice <= predictedPrice + (1 - confidence) * predictedPrice * 2
            };
            
            this.predictions.push(prediction);
          }
        });
      });
    }
    
    this.calculateAllMetrics();
  }

  public recordPrediction(prediction: Partial<PredictionRecord>): void {
    const record: PredictionRecord = {
      id: prediction.id || `${prediction.modelType}-${Date.now()}`,
      modelType: prediction.modelType || 'unknown',
      ensembleMethod: prediction.ensembleMethod,
      predictedPrice: prediction.predictedPrice || 0,
      actualPrice: prediction.actualPrice,
      confidence: prediction.confidence || 0,
      upperBound: prediction.upperBound || 0,
      lowerBound: prediction.lowerBound || 0,
      timestamp: prediction.timestamp || new Date(),
      timeframe: prediction.timeframe || '1hour',
      features: prediction.features || {},
      accuracy: prediction.accuracy,
      error: prediction.error,
      withinConfidence: prediction.withinConfidence
    };

    // Calculate accuracy if actual price is available
    if (record.actualPrice !== undefined) {
      record.error = Math.abs(record.actualPrice - record.predictedPrice) / record.actualPrice;
      record.accuracy = Math.max(0, 1 - record.error);
      record.withinConfidence = record.actualPrice >= record.lowerBound && record.actualPrice <= record.upperBound;
    }

    this.predictions.push(record);
    
    // Update metrics for this model and timeframe
    this.updateMetrics(record.modelType, record.timeframe);
    
    // Check for alerts
    this.checkAccuracyAlerts(record.modelType, record.timeframe);
  }

  public updateActualPrice(predictionId: string, actualPrice: number): void {
    const prediction = this.predictions.find(p => p.id === predictionId);
    if (!prediction) return;

    prediction.actualPrice = actualPrice;
    prediction.error = Math.abs(actualPrice - prediction.predictedPrice) / actualPrice;
    prediction.accuracy = Math.max(0, 1 - prediction.error);
    prediction.withinConfidence = actualPrice >= prediction.lowerBound && actualPrice <= prediction.upperBound;

    this.updateMetrics(prediction.modelType, prediction.timeframe);
    this.checkAccuracyAlerts(prediction.modelType, prediction.timeframe);
  }

  private updateMetrics(modelType: string, timeframe: string): void {
    const key = `${modelType}-${timeframe}`;
    const modelPredictions = this.predictions.filter(p => 
      p.modelType === modelType && 
      p.timeframe === timeframe && 
      p.actualPrice !== undefined
    );

    if (modelPredictions.length === 0) return;

    const totalPredictions = modelPredictions.length;
    const accuratePredictions = modelPredictions.filter(p => p.accuracy !== undefined && p.accuracy! >= 0.85).length;
    const accuracy = accuratePredictions / totalPredictions;

    const errors = modelPredictions.map(p => p.error || 0);
    const meanAbsoluteError = errors.reduce((sum, error) => sum + error, 0) / errors.length;
    const meanSquaredError = errors.reduce((sum, error) => sum + error * error, 0) / errors.length;
    const rootMeanSquaredError = Math.sqrt(meanSquaredError);
    const meanAbsolutePercentageError = meanAbsoluteError * 100;

    const confidencePredictions = modelPredictions.filter(p => p.withinConfidence).length;
    const confidenceAccuracy = confidencePredictions / totalPredictions;

    // Calculate trend
    const recentPredictions = modelPredictions.slice(-50);
    const recentAccuracy = recentPredictions.filter(p => p.accuracy !== undefined && p.accuracy! >= 0.85).length / recentPredictions.length;
    const olderPredictions = modelPredictions.slice(0, -50);
    const olderAccuracy = olderPredictions.length > 0 ? 
      olderPredictions.filter(p => p.accuracy !== undefined && p.accuracy! >= 0.85).length / olderPredictions.length : 0;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentAccuracy > olderAccuracy + 0.05) trend = 'improving';
    else if (recentAccuracy < olderAccuracy - 0.05) trend = 'declining';

    const metrics: AccuracyMetrics = {
      modelType,
      timeframe,
      totalPredictions,
      accuratePredictions,
      accuracy,
      meanAbsoluteError,
      meanSquaredError,
      rootMeanSquaredError,
      meanAbsolutePercentageError,
      confidenceAccuracy,
      lastUpdated: new Date(),
      trend,
      recentAccuracy,
      longTermAccuracy: accuracy
    };

    this.metrics.set(key, metrics);
  }

  private checkAccuracyAlerts(modelType: string, timeframe: string): void {
    const key = `${modelType}-${timeframe}`;
    const metrics = this.metrics.get(key);
    const threshold = this.thresholds.get(modelType) || this.thresholds.get('default') || 
                     { warning: 0.80, critical: 0.70, retrainThreshold: 0.60 };

    if (!metrics) return;

    if (metrics.accuracy < threshold.retrainThreshold) {
      this.addAlert(`CRITICAL: ${modelType} accuracy (${(metrics.accuracy * 100).toFixed(1)}%) below retrain threshold for ${timeframe}. Immediate retraining required.`);
    } else if (metrics.accuracy < threshold.critical) {
      this.addAlert(`CRITICAL: ${modelType} accuracy (${(metrics.accuracy * 100).toFixed(1)}%) below critical threshold for ${timeframe}. Consider retraining.`);
    } else if (metrics.accuracy < threshold.warning) {
      this.addAlert(`WARNING: ${modelType} accuracy (${(metrics.accuracy * 100).toFixed(1)}%) below warning threshold for ${timeframe}. Monitor closely.`);
    } else if (metrics.trend === 'declining' && metrics.accuracy < threshold.warning + 0.05) {
      this.addAlert(`WARNING: ${modelType} showing declining accuracy trend for ${timeframe}. Proactive monitoring recommended.`);
    }
  }

  private addAlert(message: string): void {
    this.alerts.push(message);
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  private calculateAllMetrics(): void {
    const uniqueCombinations = new Set<string>();
    
    this.predictions.forEach(prediction => {
      if (prediction.actualPrice !== undefined) {
        uniqueCombinations.add(`${prediction.modelType}-${prediction.timeframe}`);
      }
    });

    uniqueCombinations.forEach(combination => {
      const [modelType, timeframe] = combination.split('-');
      this.updateMetrics(modelType, timeframe);
    });
  }

  public getMetrics(modelType: string, timeframe: string): AccuracyMetrics | undefined {
    return this.metrics.get(`${modelType}-${timeframe}`);
  }

  public getAllMetrics(): Map<string, AccuracyMetrics> {
    return new Map(this.metrics);
  }

  public getModelMetrics(modelType: string): AccuracyMetrics[] {
    const modelMetrics: AccuracyMetrics[] = [];
    
    this.metrics.forEach((metrics, key) => {
      if (metrics.modelType === modelType) {
        modelMetrics.push(metrics);
      }
    });
    
    return modelMetrics.sort((a, b) => b.accuracy - a.accuracy);
  }

  public getTimeframeMetrics(timeframe: string): AccuracyMetrics[] {
    const timeframeMetrics: AccuracyMetrics[] = [];
    
    this.metrics.forEach((metrics, key) => {
      if (metrics.timeframe === timeframe) {
        timeframeMetrics.push(metrics);
      }
    });
    
    return timeframeMetrics.sort((a, b) => b.accuracy - a.accuracy);
  }

  public getTopPerformingModels(limit: number = 10): Array<{ modelType: string; accuracy: number; timeframe: string }> {
    const allMetrics = Array.from(this.metrics.values());
    
    return allMetrics
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, limit)
      .map(metrics => ({
        modelType: metrics.modelType,
        accuracy: metrics.accuracy,
        timeframe: metrics.timeframe
      }));
  }

  public getPerformanceReport(
    modelType: string,
    timeframe: string,
    period: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): PerformanceReport | undefined {
    const metrics = this.getMetrics(modelType, timeframe);
    if (!metrics) return undefined;

    const now = new Date();
    let periodStart: Date;
    
    switch (period) {
      case 'daily':
        periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const periodPredictions = this.predictions.filter(p => 
      p.modelType === modelType &&
      p.timeframe === timeframe &&
      p.timestamp >= periodStart &&
      p.actualPrice !== undefined
    );

    if (periodPredictions.length === 0) return undefined;

    const periodAccuracy = periodPredictions.filter(p => p.accuracy !== undefined && p.accuracy! >= 0.85).length / periodPredictions.length;
    const periodError = periodPredictions.reduce((sum, p) => sum + (p.error || 0), 0) / periodPredictions.length;
    const periodConfidence = periodPredictions.reduce((sum, p) => sum + p.confidence, 0) / periodPredictions.length;

    // Calculate improvement
    const previousPeriodStart = new Date(periodStart.getTime() - (periodStart.getTime() - now.getTime()));
    const previousPredictions = this.predictions.filter(p => 
      p.modelType === modelType &&
      p.timeframe === timeframe &&
      p.timestamp >= previousPeriodStart &&
      p.timestamp < periodStart &&
      p.actualPrice !== undefined
    );

    let improvement = 0;
    if (previousPredictions.length > 0) {
      const previousAccuracy = previousPredictions.filter(p => p.accuracy !== undefined && p.accuracy! >= 0.85).length / previousPredictions.length;
      improvement = periodAccuracy - previousAccuracy;
    }

    // Calculate ranking
    const allTimeframeMetrics = this.getTimeframeMetrics(timeframe);
    const ranking = allTimeframeMetrics.findIndex(m => m.modelType === modelType) + 1;

    // Generate recommendations
    const recommendations = this.generateRecommendations(metrics, periodAccuracy, improvement);

    return {
      modelType,
      timeframe,
      period,
      accuracy: periodAccuracy,
      error: periodError,
      confidence: periodConfidence,
      predictions: periodPredictions.length,
      improvement,
      ranking,
      recommendations
    };
  }

  private generateRecommendations(metrics: AccuracyMetrics, recentAccuracy: number, improvement: number): string[] {
    const recommendations: string[] = [];

    if (metrics.accuracy < 0.85) {
      recommendations.push('Consider retraining the model to improve accuracy');
    }

    if (metrics.confidenceAccuracy < 0.80) {
      recommendations.push('Confidence intervals may be too narrow - consider adjusting uncertainty estimates');
    }

    if (metrics.trend === 'declining') {
      recommendations.push('Model performance is declining - investigate data quality or model drift');
    }

    if (improvement < -0.05) {
      recommendations.push('Recent performance has decreased - review recent market conditions');
    }

    if (metrics.meanAbsolutePercentageError > 10) {
      recommendations.push('High percentage error detected - consider feature engineering');
    }

    if (metrics.totalPredictions < 100) {
      recommendations.push('Low prediction count - need more data for reliable accuracy assessment');
    }

    if (recommendations.length === 0) {
      recommendations.push('Model performance is within acceptable ranges');
    }

    return recommendations;
  }

  public getAccuracyTrend(modelType: string, timeframe: string, days: number = 30): Array<{ date: Date; accuracy: number }> {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const modelPredictions = this.predictions.filter(p => 
      p.modelType === modelType &&
      p.timeframe === timeframe &&
      p.timestamp >= startDate &&
      p.actualPrice !== undefined
    );

    const dailyAccuracy: Map<string, number[]> = new Map();
    
    modelPredictions.forEach(prediction => {
      const dateKey = prediction.timestamp.toISOString().split('T')[0];
      if (!dailyAccuracy.has(dateKey)) {
        dailyAccuracy.set(dateKey, []);
      }
      dailyAccuracy.get(dateKey)!.push(prediction.accuracy || 0);
    });

    const trend: Array<{ date: Date; accuracy: number }> = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      const dayAccuracies = dailyAccuracy.get(dateKey) || [];
      
      const avgAccuracy = dayAccuracies.length > 0 ? 
        dayAccuracies.reduce((sum, acc) => sum + acc, 0) / dayAccuracies.length : 0;
      
      trend.push({ date, accuracy: avgAccuracy });
    }

    return trend;
  }

  public getConfidenceIntervalAccuracy(modelType: string, timeframe: string): {
    within95: number;
    within90: number;
    within80: number;
    average: number;
  } {
    const modelPredictions = this.predictions.filter(p => 
      p.modelType === modelType &&
      p.timeframe === timeframe &&
      p.actualPrice !== undefined
    );

    if (modelPredictions.length === 0) {
      return { within95: 0, within90: 0, within80: 0, average: 0 };
    }

    const within95 = modelPredictions.filter(p => p.withinConfidence).length / modelPredictions.length;
    
    // Calculate for 90% and 80% confidence intervals
    const within90 = modelPredictions.filter(p => {
      const range = (p.upperBound - p.lowerBound) * 0.9;
      const center = (p.upperBound + p.lowerBound) / 2;
      return p.actualPrice! >= center - range/2 && p.actualPrice! <= center + range/2;
    }).length / modelPredictions.length;

    const within80 = modelPredictions.filter(p => {
      const range = (p.upperBound - p.lowerBound) * 0.8;
      const center = (p.upperBound + p.lowerBound) / 2;
      return p.actualPrice! >= center - range/2 && p.actualPrice! <= center + range/2;
    }).length / modelPredictions.length;

    const average = (within95 + within90 + within80) / 3;

    return { within95, within90, within80, average };
  }

  public getModelComparison(timeframe: string): Array<{
    modelType: string;
    accuracy: number;
    confidence: number;
    error: number;
    predictions: number;
    trend: string;
  }> {
    const timeframeMetrics = this.getTimeframeMetrics(timeframe);
    
    return timeframeMetrics.map(metrics => ({
      modelType: metrics.modelType,
      accuracy: metrics.accuracy,
      confidence: metrics.confidenceAccuracy,
      error: metrics.meanAbsoluteError,
      predictions: metrics.totalPredictions,
      trend: metrics.trend
    })).sort((a, b) => b.accuracy - a.accuracy);
  }

  public getAlerts(limit: number = 50): string[] {
    return this.alerts.slice(-limit);
  }

  public clearAlerts(): void {
    this.alerts = [];
  }

  public exportMetrics(): {
    metrics: AccuracyMetrics[];
    predictions: PredictionRecord[];
    alerts: string[];
    exportDate: Date;
  } {
    return {
      metrics: Array.from(this.metrics.values()),
      predictions: this.predictions,
      alerts: this.alerts,
      exportDate: new Date()
    };
  }

  public importMetrics(data: {
    metrics: AccuracyMetrics[];
    predictions: PredictionRecord[];
    alerts: string[];
  }): void {
    this.metrics.clear();
    data.metrics.forEach(metric => {
      this.metrics.set(`${metric.modelType}-${metric.timeframe}`, metric);
    });

    this.predictions = data.predictions;
    this.alerts = data.alerts;
  }

  public getSummaryStats(): {
    totalPredictions: number;
    modelsTracked: number;
    timeframesTracked: number;
    averageAccuracy: number;
    bestModel: string;
    worstModel: string;
    alertsCount: number;
  } {
    const totalPredictions = this.predictions.length;
    const modelsTracked = new Set(this.predictions.map(p => p.modelType)).size;
    const timeframesTracked = new Set(this.predictions.map(p => p.timeframe)).size;
    
    const allMetrics = Array.from(this.metrics.values());
    const averageAccuracy = allMetrics.length > 0 ? 
      allMetrics.reduce((sum, m) => sum + m.accuracy, 0) / allMetrics.length : 0;
    
    const bestMetric = allMetrics.reduce((best, current) => 
      current.accuracy > best.accuracy ? current : best, allMetrics[0]);
    const worstMetric = allMetrics.reduce((worst, current) => 
      current.accuracy < worst.accuracy ? current : worst, allMetrics[0]);

    return {
      totalPredictions,
      modelsTracked,
      timeframesTracked,
      averageAccuracy,
      bestModel: bestMetric?.modelType || 'N/A',
      worstModel: worstMetric?.modelType || 'N/A',
      alertsCount: this.alerts.length
    };
  }
}

export default AccuracyTracker;
