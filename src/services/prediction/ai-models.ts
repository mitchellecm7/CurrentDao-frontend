interface PriceData {
  timestamp: Date;
  price: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

interface FeatureData {
  price: number;
  volume: number;
  volatility: number;
  trend: number;
  momentum: number;
  rsi: number;
  macd: number;
  bollingerUpper: number;
  bollingerLower: number;
  movingAverage: number;
  timeOfDay: number;
  dayOfWeek: number;
  seasonality: number;
}

interface ModelPrediction {
  predictedPrice: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
  probabilityDistribution: number[];
  features: FeatureData;
  timestamp: Date;
  modelType: string;
  accuracy: number;
}

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  meanAbsoluteError: number;
  meanSquaredError: number;
  r2Score: number;
  lastUpdated: Date;
}

class AIModels {
  private models: Map<string, any> = new Map();
  private modelMetrics: Map<string, ModelMetrics> = new Map();
  private trainingData: PriceData[] = [];
  private isTraining: boolean = false;

  constructor() {
    this.initializeModels();
    this.loadTrainingData();
  }

  private initializeModels() {
    // Initialize different AI models for price prediction
    this.models.set('lstm', {
      type: 'LSTM',
      parameters: {
        hiddenLayers: 3,
        units: [128, 64, 32],
        dropout: 0.2,
        learningRate: 0.001,
        epochs: 100,
        batchSize: 32
      },
      weights: this.generateRandomWeights(),
      isTrained: false
    });

    this.models.set('random_forest', {
      type: 'RandomForest',
      parameters: {
        nEstimators: 100,
        maxDepth: 10,
        minSamplesSplit: 2,
        minSamplesLeaf: 1,
        randomState: 42
      },
      trees: this.generateRandomTrees(),
      isTrained: false
    });

    this.models.set('gradient_boosting', {
      type: 'GradientBoosting',
      parameters: {
        nEstimators: 200,
        learningRate: 0.1,
        maxDepth: 6,
        minSamplesSplit: 2,
        loss: 'ls'
      },
      trees: this.generateRandomTrees(),
      isTrained: false
    });

    this.models.set('neural_network', {
      type: 'NeuralNetwork',
      parameters: {
        hiddenLayers: [256, 128, 64, 32],
        activation: 'relu',
        optimizer: 'adam',
        learningRate: 0.001,
        epochs: 150
      },
      weights: this.generateRandomWeights(),
      isTrained: false
    });

    this.models.set('arima', {
      type: 'ARIMA',
      parameters: {
        p: 1, // AR order
        d: 1, // differencing order
        q: 1, // MA order
        seasonalOrder: [1, 1, 1, 24], // seasonal parameters
        enforceStationarity: true,
        enforceInvertibility: true
      },
      coefficients: this.generateRandomCoefficients(),
      isTrained: false
    });

    // Initialize model metrics
    this.initializeModelMetrics();
  }

  private initializeModelMetrics() {
    const modelTypes = ['lstm', 'random_forest', 'gradient_boosting', 'neural_network', 'arima'];
    
    modelTypes.forEach(modelType => {
      this.modelMetrics.set(modelType, {
        accuracy: 0.85 + Math.random() * 0.1, // Start with 85-95% accuracy
        precision: 0.82 + Math.random() * 0.13,
        recall: 0.84 + Math.random() * 0.11,
        f1Score: 0.83 + Math.random() * 0.12,
        meanAbsoluteError: Math.random() * 0.05,
        meanSquaredError: Math.random() * 0.01,
        r2Score: 0.85 + Math.random() * 0.1,
        lastUpdated: new Date()
      });
    });
  }

  private loadTrainingData() {
    // Generate mock training data
    const now = new Date();
    const basePrice = 100;
    
    for (let i = 1000; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60000); // 1-minute intervals
      const priceVariation = Math.sin(i / 100) * 10 + Math.random() * 5 - 2.5;
      const price = basePrice + priceVariation;
      
      this.trainingData.push({
        timestamp,
        price,
        volume: Math.floor(Math.random() * 10000) + 1000,
        high: price + Math.random() * 2,
        low: price - Math.random() * 2,
        open: price + (Math.random() - 0.5),
        close: price
      });
    }
  }

  private generateRandomWeights(): number[][][] {
    const weights: number[][][] = [];
    const layers = [128, 64, 32];
    
    for (let i = 0; i < layers.length; i++) {
      const layerWeights: number[][] = [];
      const inputSize = i === 0 ? 12 : layers[i - 1]; // 12 features
      
      for (let j = 0; j < layers[i]; j++) {
        const neuronWeights: number[] = [];
        for (let k = 0; k < inputSize; k++) {
          neuronWeights.push((Math.random() - 0.5) * 2);
        }
        layerWeights.push(neuronWeights);
      }
      weights.push(layerWeights);
    }
    
    return weights;
  }

  private generateRandomTrees(): any[] {
    const trees: any[] = [];
    const nTrees = 100;
    
    for (let i = 0; i < nTrees; i++) {
      trees.push({
        id: i,
        depth: Math.floor(Math.random() * 10) + 1,
        nodes: this.generateRandomNodes(),
        importance: Math.random()
      });
    }
    
    return trees;
  }

  private generateRandomNodes(): any[] {
    const nodes: any[] = [];
    const nNodes = Math.floor(Math.random() * 50) + 10;
    
    for (let i = 0; i < nNodes; i++) {
      nodes.push({
        id: i,
        feature: Math.floor(Math.random() * 12),
        threshold: Math.random(),
        leftChild: i * 2 + 1,
        rightChild: i * 2 + 2,
        value: Math.random() * 200,
        isLeaf: Math.random() > 0.7
      });
    }
    
    return nodes;
  }

  private generateRandomCoefficients(): number[] {
    const coefficients: number[] = [];
    const nCoefficients = 4; // AR(1) + MA(1) + seasonal components
    
    for (let i = 0; i < nCoefficients; i++) {
      coefficients.push((Math.random() - 0.5) * 0.5);
    }
    
    return coefficients;
  }

  public async trainModel(modelType: string): Promise<boolean> {
    if (this.isTraining) {
      throw new Error('Model training is already in progress');
    }

    this.isTraining = true;
    const model = this.models.get(modelType);
    
    if (!model) {
      this.isTraining = false;
      throw new Error(`Model ${modelType} not found`);
    }

    try {
      // Simulate model training
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      model.isTrained = true;
      
      // Update model metrics
      const metrics = this.modelMetrics.get(modelType);
      if (metrics) {
        metrics.accuracy = 0.88 + Math.random() * 0.07; // 88-95% accuracy
        metrics.precision = 0.85 + Math.random() * 0.10;
        metrics.recall = 0.86 + Math.random() * 0.09;
        metrics.f1Score = 0.85 + Math.random() * 0.10;
        metrics.meanAbsoluteError = Math.random() * 0.03;
        metrics.meanSquaredError = Math.random() * 0.008;
        metrics.r2Score = 0.88 + Math.random() * 0.07;
        metrics.lastUpdated = new Date();
      }
      
      this.isTraining = false;
      return true;
    } catch (error) {
      this.isTraining = false;
      throw error;
    }
  }

  public async predict(modelType: string, timeframe: string, customFeatures?: Partial<FeatureData>): Promise<ModelPrediction> {
    const model = this.models.get(modelType);
    
    if (!model || !model.isTrained) {
      throw new Error(`Model ${modelType} is not trained`);
    }

    const features = this.extractFeatures(customFeatures);
    const prediction = this.generatePrediction(modelType, features, timeframe);
    
    return {
      predictedPrice: prediction.price,
      confidence: prediction.confidence,
      upperBound: prediction.upperBound,
      lowerBound: prediction.lowerBound,
      probabilityDistribution: this.generateProbabilityDistribution(prediction.price, prediction.confidence),
      features,
      timestamp: new Date(),
      modelType,
      accuracy: this.getModelAccuracy(modelType)
    };
  }

  private extractFeatures(customFeatures?: Partial<FeatureData>): FeatureData {
    const recentData = this.trainingData.slice(-50);
    const latestPrice = recentData[recentData.length - 1].price;
    
    // Calculate technical indicators
    const prices = recentData.map(d => d.price);
    const volumes = recentData.map(d => d.volume);
    
    const movingAverage = this.calculateMovingAverage(prices, 20);
    const volatility = this.calculateVolatility(prices);
    const trend = this.calculateTrend(prices);
    const momentum = this.calculateMomentum(prices);
    const rsi = this.calculateRSI(prices);
    const macd = this.calculateMACD(prices);
    const bollingerBands = this.calculateBollingerBands(prices);
    
    const now = new Date();
    const timeOfDay = now.getHours() / 24;
    const dayOfWeek = now.getDay() / 7;
    const seasonality = Math.sin((now.getMonth() / 12) * 2 * Math.PI);

    return {
      price: latestPrice,
      volume: volumes[volumes.length - 1],
      volatility,
      trend,
      momentum,
      rsi,
      macd,
      bollingerUpper: bollingerBands.upper,
      bollingerLower: bollingerBands.lower,
      movingAverage,
      timeOfDay,
      dayOfWeek,
      seasonality,
      ...customFeatures
    };
  }

  private calculateMovingAverage(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  private calculateTrend(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    
    return (lastPrice - firstPrice) / firstPrice;
  }

  private calculateMomentum(prices: number[]): number {
    if (prices.length < 20) return 0;
    
    const currentPrice = prices[prices.length - 1];
    const price20DaysAgo = prices[prices.length - 20];
    
    return (currentPrice - price20DaysAgo) / price20DaysAgo;
  }

  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;
    
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }
    
    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(prices: number[]): number {
    if (prices.length < 26) return 0;
    
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    
    return ema12 - ema26;
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  }

  private calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): { upper: number; lower: number } {
    if (prices.length < period) {
      const price = prices[prices.length - 1];
      return { upper: price + 2, lower: price - 2 };
    }
    
    const recentPrices = prices.slice(-period);
    const mean = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const variance = recentPrices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recentPrices.length;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: mean + (stdDev * standardDeviation),
      lower: mean - (stdDev * standardDeviation)
    };
  }

  private generatePrediction(modelType: string, features: FeatureData, timeframe: string): { price: number; confidence: number; upperBound: number; lowerBound: number } {
    const basePrice = features.price;
    const timeMultiplier = this.getTimeframeMultiplier(timeframe);
    
    // Model-specific prediction logic
    let prediction: number;
    let confidence: number;
    
    switch (modelType) {
      case 'lstm':
        prediction = basePrice * (1 + features.trend * 0.1 + features.momentum * 0.05 + (Math.random() - 0.5) * 0.02);
        confidence = 0.88;
        break;
      case 'random_forest':
        prediction = basePrice * (1 + features.trend * 0.08 + features.volatility * 0.03 + (Math.random() - 0.5) * 0.015);
        confidence = 0.85;
        break;
      case 'gradient_boosting':
        prediction = basePrice * (1 + features.trend * 0.09 + features.momentum * 0.04 + (Math.random() - 0.5) * 0.018);
        confidence = 0.87;
        break;
      case 'neural_network':
        prediction = basePrice * (1 + features.trend * 0.12 + features.momentum * 0.06 + (Math.random() - 0.5) * 0.025);
        confidence = 0.89;
        break;
      case 'arima':
        prediction = basePrice * (1 + features.trend * 0.07 + features.seasonality * 0.02 + (Math.random() - 0.5) * 0.012);
        confidence = 0.84;
        break;
      default:
        prediction = basePrice * (1 + (Math.random() - 0.5) * 0.05);
        confidence = 0.80;
    }
    
    // Apply timeframe multiplier
    prediction = basePrice + (prediction - basePrice) * timeMultiplier;
    
    // Calculate confidence bounds
    const volatility = features.volatility * timeMultiplier;
    const upperBound = prediction + (volatility * 1.96); // 95% confidence interval
    const lowerBound = prediction - (volatility * 1.96);
    
    return {
      price: prediction,
      confidence,
      upperBound,
      lowerBound
    };
  }

  private getTimeframeMultiplier(timeframe: string): number {
    const multipliers: { [key: string]: number } = {
      '1min': 0.01,
      '5min': 0.05,
      '15min': 0.15,
      '30min': 0.3,
      '1hour': 0.6,
      '4hour': 2.4,
      '1day': 5.8,
      '1week': 40.6,
      '1month': 174.3
    };
    
    return multipliers[timeframe] || 1;
  }

  private generateProbabilityDistribution(predictedPrice: number, confidence: number): number[] {
    const distribution: number[] = [];
    const stdDev = (1 - confidence) * predictedPrice * 0.1;
    const range = 4 * stdDev; // ±2 standard deviations
    const step = range / 100;
    
    for (let i = 0; i <= 100; i++) {
      const x = predictedPrice - 2 * stdDev + (i * step);
      const probability = this.gaussianPDF(x, predictedPrice, stdDev);
      distribution.push(probability);
    }
    
    // Normalize distribution
    const sum = distribution.reduce((a, b) => a + b, 0);
    return distribution.map(p => p / sum);
  }

  private gaussianPDF(x: number, mean: number, stdDev: number): number {
    const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
    return coefficient * Math.exp(exponent);
  }

  public getModelAccuracy(modelType: string): number {
    const metrics = this.modelMetrics.get(modelType);
    return metrics ? metrics.accuracy : 0;
  }

  public getModelMetrics(modelType: string): ModelMetrics | undefined {
    return this.modelMetrics.get(modelType);
  }

  public getAllModelMetrics(): Map<string, ModelMetrics> {
    return new Map(this.modelMetrics);
  }

  public getAvailableModels(): string[] {
    return Array.from(this.models.keys());
  }

  public isModelTrained(modelType: string): boolean {
    const model = this.models.get(modelType);
    return model ? model.isTrained : false;
  }

  public async retrainAllModels(): Promise<boolean[]> {
    const results: boolean[] = [];
    
    for (const modelType of this.getAvailableModels()) {
      try {
        const result = await this.trainModel(modelType);
        results.push(result);
      } catch (error) {
        results.push(false);
      }
    }
    
    return results;
  }

  public updateModelMetrics(modelType: string, actualPrice: number, predictedPrice: number): void {
    const metrics = this.modelMetrics.get(modelType);
    if (!metrics) return;
    
    const error = Math.abs(actualPrice - predictedPrice) / actualPrice;
    const accuracy = Math.max(0, 1 - error);
    
    // Update metrics with exponential moving average
    const alpha = 0.1; // Learning rate
    metrics.accuracy = (alpha * accuracy) + ((1 - alpha) * metrics.accuracy);
    metrics.meanAbsoluteError = (alpha * error) + ((1 - alpha) * metrics.meanAbsoluteError);
    metrics.meanSquaredError = (alpha * Math.pow(error, 2)) + ((1 - alpha) * metrics.meanSquaredError);
    metrics.lastUpdated = new Date();
  }

  public getModelFeatureImportance(modelType: string): Map<string, number> {
    const importance = new Map<string, number>();
    
    // Simulate feature importance based on model type
    const baseImportance = {
      price: 0.25,
      volume: 0.15,
      volatility: 0.12,
      trend: 0.18,
      momentum: 0.10,
      rsi: 0.08,
      macd: 0.06,
      bollingerUpper: 0.02,
      bollingerLower: 0.02,
      movingAverage: 0.02,
      timeOfDay: 0.01,
      dayOfWeek: 0.01,
      seasonality: 0.01
    };
    
    // Adjust importance based on model type
    switch (modelType) {
      case 'lstm':
        baseImportance.trend += 0.05;
        baseImportance.momentum += 0.03;
        break;
      case 'random_forest':
        baseImportance.price += 0.05;
        baseImportance.volume += 0.03;
        break;
      case 'gradient_boosting':
        baseImportance.volatility += 0.04;
        baseImportance.trend += 0.02;
        break;
      case 'neural_network':
        baseImportance.price += 0.03;
        baseImportance.trend += 0.04;
        break;
      case 'arima':
        baseImportance.seasonality += 0.05;
        baseImportance.trend += 0.03;
        break;
    }
    
    // Normalize to sum to 1
    const sum = Object.values(baseImportance).reduce((a, b) => a + b, 0);
    Object.entries(baseImportance).forEach(([feature, value]) => {
      importance.set(feature, value / sum);
    });
    
    return importance;
  }
}

export default AIModels;
