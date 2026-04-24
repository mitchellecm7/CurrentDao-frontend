export interface MarketData {
  timestamp: Date;
  price: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

export interface SentimentData {
  timestamp: Date;
  sentiment: number;
  confidence: number;
  volume: number;
  source: string;
}

export interface CorrelationResult {
  correlation: number;
  pValue: number;
  coefficient: number;
  intercept: number;
  rSquared: number;
  significance: 'high' | 'medium' | 'low';
  lagHours: number;
  direction: 'positive' | 'negative' | 'neutral';
}

export interface MarketSentimentSignal {
  timestamp: Date;
  signal: 'buy' | 'sell' | 'hold';
  confidence: number;
  sentimentScore: number;
  priceChange: number;
  volumeChange: number;
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  reasoning: string;
}

export interface SentimentPrediction {
  timestamp: Date;
  predictedSentiment: number;
  confidence: number;
  predictedPrice: number;
  predictionHorizon: number; // hours
  modelAccuracy: number;
  factors: Array<{
    name: string;
    weight: number;
    contribution: number;
  }>;
}

export class MarketCorrelationService {
  private static instance: MarketCorrelationService;
  private cache: { [key: string]: any } = {};

  static getInstance(): MarketCorrelationService {
    if (!MarketCorrelationService.instance) {
      MarketCorrelationService.instance = new MarketCorrelationService();
    }
    return MarketCorrelationService.instance;
  }

  calculateCorrelation(
    marketData: MarketData[],
    sentimentData: SentimentData[],
    maxLag: number = 24
  ): CorrelationResult {
    const cacheKey = `corr_${marketData.length}_${sentimentData.length}_${maxLag}`;
    
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    let bestCorrelation = 0;
    let bestLag = 0;
    let bestResult: CorrelationResult | null = null;

    for (let lag = 0; lag <= maxLag; lag++) {
      const alignedData = this.alignDataWithLag(marketData, sentimentData, lag);
      if (alignedData.market.length < 10) continue;

      const correlation = this.pearsonCorrelation(
        alignedData.market.map(d => d.close),
        alignedData.sentiment.map(d => d.sentiment)
      );

      if (Math.abs(correlation) > Math.abs(bestCorrelation)) {
        bestCorrelation = correlation;
        bestLag = lag;
        
        const regression = this.linearRegression(
          alignedData.market.map(d => d.close),
          alignedData.sentiment.map(d => d.sentiment)
        );

        bestResult = {
          correlation: bestCorrelation,
          pValue: this.calculatePValue(bestCorrelation, alignedData.market.length),
          coefficient: regression.slope,
          intercept: regression.intercept,
          rSquared: regression.rSquared,
          significance: this.getSignificanceLevel(Math.abs(bestCorrelation)),
          lagHours: bestLag,
          direction: bestCorrelation > 0.1 ? 'positive' : bestCorrelation < -0.1 ? 'negative' : 'neutral'
        };
      }
    }

    if (bestResult) {
      this.cache[cacheKey] = bestResult;
    }

    return bestResult || {
      correlation: 0,
      pValue: 1,
      coefficient: 0,
      intercept: 0,
      rSquared: 0,
      significance: 'low',
      lagHours: 0,
      direction: 'neutral'
    };
  }

  private alignDataWithLag(
    marketData: MarketData[],
    sentimentData: SentimentData[],
    lagHours: number
  ): { market: MarketData[]; sentiment: SentimentData[] } {
    const lagMs = lagHours * 60 * 60 * 1000;
    const aligned: { market: MarketData[]; sentiment: SentimentData[] } = {
      market: [],
      sentiment: []
    };

    marketData.forEach(marketPoint => {
      const targetTime = new Date(marketPoint.timestamp.getTime() - lagMs);
      const sentimentPoint = this.findClosestSentiment(sentimentData, targetTime);
      
      if (sentimentPoint && Math.abs(sentimentPoint.timestamp.getTime() - targetTime.getTime()) < 60 * 60 * 1000) {
        aligned.market.push(marketPoint);
        aligned.sentiment.push(sentimentPoint);
      }
    });

    return aligned;
  }

  private findClosestSentiment(sentimentData: SentimentData[], targetTime: Date): SentimentData | null {
    let closest: SentimentData | null = null;
    let minDiff = Infinity;

    sentimentData.forEach(point => {
      const diff = Math.abs(point.timestamp.getTime() - targetTime.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closest = point;
      }
    });

    return closest;
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private linearRegression(x: number[], y: number[]): { slope: number; intercept: number; rSquared: number } {
    const n = x.length;
    if (n === 0) return { slope: 0, intercept: 0, rSquared: 0 };

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const yMean = sumY / n;
    const ssTotal = y.reduce((total, yi) => total + Math.pow(yi - yMean, 2), 0);
    const ssResidual = y.reduce((total, yi, i) => {
      const predicted = slope * x[i] + intercept;
      return total + Math.pow(yi - predicted, 2);
    }, 0);

    const rSquared = ssTotal === 0 ? 0 : 1 - (ssResidual / ssTotal);

    return { slope, intercept, rSquared };
  }

  private calculatePValue(correlation: number, n: number): number {
    if (n <= 2) return 1;

    const t = Math.abs(correlation) * Math.sqrt((n - 2) / (1 - correlation * correlation));
    // Simplified p-value calculation
    return 2 * (1 - this.tCDF(t, n - 2));
  }

  private tCDF(t: number, df: number): number {
    // Simplified t-distribution CDF
    return 0.5 + (t / Math.sqrt(df)) * 0.5; // Approximation
  }

  private getSignificanceLevel(correlation: number): 'high' | 'medium' | 'low' {
    if (correlation >= 0.7) return 'high';
    if (correlation >= 0.4) return 'medium';
    return 'low';
  }

  generateSentimentSignals(
    marketData: MarketData[],
    sentimentData: SentimentData[],
    threshold: number = 0.3
  ): MarketSentimentSignal[] {
    const signals: MarketSentimentSignal[] = [];
    const correlation = this.calculateCorrelation(marketData, sentimentData);

    for (let i = 1; i < marketData.length; i++) {
      const currentMarket = marketData[i];
      const previousMarket = marketData[i - 1];
      
      const currentSentiment = this.findClosestSentiment(sentimentData, currentMarket.timestamp);
      const previousSentiment = this.findClosestSentiment(sentimentData, previousMarket.timestamp);

      if (currentSentiment && previousSentiment) {
        const sentimentChange = currentSentiment.sentiment - previousSentiment.sentiment;
        const priceChange = (currentMarket.close - previousMarket.close) / previousMarket.close;
        const volumeChange = (currentMarket.volume - previousMarket.volume) / previousMarket.volume;

        const signal = this.determineSignal(
          sentimentChange,
          priceChange,
          correlation.correlation,
          threshold
        );

        if (signal !== 'hold') {
          signals.push({
            timestamp: currentMarket.timestamp,
            signal,
            confidence: this.calculateSignalConfidence(
              sentimentChange,
              correlation.correlation,
              currentSentiment.confidence
            ),
            sentimentScore: currentSentiment.sentiment,
            priceChange: priceChange * 100,
            volumeChange: volumeChange * 100,
            expectedReturn: this.calculateExpectedReturn(signal, correlation.correlation, sentimentChange),
            riskLevel: this.assessRiskLevel(correlation.correlation, currentSentiment.confidence),
            reasoning: this.generateSignalReasoning(signal, sentimentChange, correlation)
          });
        }
      }
    }

    return signals;
  }

  private determineSignal(
    sentimentChange: number,
    priceChange: number,
    correlation: number,
    threshold: number
  ): 'buy' | 'sell' | 'hold' {
    if (Math.abs(sentimentChange) < threshold) return 'hold';

    if (correlation > 0.3) {
      // Positive correlation - sentiment leads price
      return sentimentChange > 0 ? 'buy' : 'sell';
    } else if (correlation < -0.3) {
      // Negative correlation - inverse relationship
      return sentimentChange > 0 ? 'sell' : 'buy';
    }

    return 'hold';
  }

  private calculateSignalConfidence(
    sentimentChange: number,
    correlation: number,
    sentimentConfidence: number
  ): number {
    const changeWeight = Math.min(Math.abs(sentimentChange) / 0.5, 1);
    const correlationWeight = Math.abs(correlation);
    const confidenceWeight = sentimentConfidence;

    return (changeWeight * 0.3 + correlationWeight * 0.4 + confidenceWeight * 0.3);
  }

  private calculateExpectedReturn(
    signal: 'buy' | 'sell' | 'hold',
    correlation: number,
    sentimentChange: number
  ): number {
    const baseReturn = Math.abs(sentimentChange) * Math.abs(correlation) * 0.05;
    return signal === 'hold' ? 0 : baseReturn;
  }

  private assessRiskLevel(correlation: number, confidence: number): 'low' | 'medium' | 'high' {
    const riskScore = (1 - Math.abs(correlation)) * 0.6 + (1 - confidence) * 0.4;
    
    if (riskScore < 0.3) return 'low';
    if (riskScore < 0.6) return 'medium';
    return 'high';
  }

  private generateSignalReasoning(
    signal: 'buy' | 'sell' | 'hold',
    sentimentChange: number,
    correlation: CorrelationResult
  ): string {
    const direction = sentimentChange > 0 ? 'positive' : 'negative';
    const strength = Math.abs(sentimentChange) > 0.5 ? 'strong' : 'moderate';
    const corrDirection = correlation.correlation > 0 ? 'positive' : 'negative';
    
    return `${strength} ${direction} sentiment detected with ${corrDirection} correlation (${correlation.correlation.toFixed(2)})`;
  }

  predictMarketSentiment(
    historicalSentiment: SentimentData[],
    marketData: MarketData[],
    horizonHours: number = 24
  ): SentimentPrediction[] {
    const predictions: SentimentPrediction[] = [];
    const correlation = this.calculateCorrelation(marketData, historicalSentiment);

    // Use weighted moving average and trend analysis
    const recentSentiment = historicalSentiment.slice(-50);
    const weights = this.generateExponentialWeights(recentSentiment.length);

    for (let hour = 1; hour <= horizonHours; hour++) {
      const trend = this.calculateTrend(recentSentiment);
      const seasonalFactor = this.calculateSeasonalFactor(recentSentiment, hour);
      const marketInfluence = this.calculateMarketInfluence(marketData, correlation);

      const predictedSentiment = this.applyFactors(
        trend,
        seasonalFactor,
        marketInfluence,
        weights
      );

      predictions.push({
        timestamp: new Date(Date.now() + hour * 60 * 60 * 1000),
        predictedSentiment,
        confidence: Math.max(0.5, 0.9 - (hour / horizonHours) * 0.3),
        predictedPrice: this.predictPriceFromSentiment(predictedSentiment, correlation),
        predictionHorizon: hour,
        modelAccuracy: this.calculateModelAccuracy(correlation),
        factors: [
          { name: 'trend', weight: 0.4, contribution: trend },
          { name: 'seasonal', weight: 0.2, contribution: seasonalFactor },
          { name: 'market', weight: 0.3, contribution: marketInfluence },
          { name: 'momentum', weight: 0.1, contribution: this.calculateMomentum(recentSentiment) }
        ]
      });
    }

    return predictions;
  }

  private generateExponentialWeights(length: number): number[] {
    const weights: number[] = [];
    const alpha = 0.3;
    
    for (let i = 0; i < length; i++) {
      weights.push(alpha * Math.pow(1 - alpha, length - i - 1));
    }
    
    const sum = weights.reduce((a, b) => a + b, 0);
    return weights.map(w => w / sum);
  }

  private calculateTrend(sentimentData: SentimentData[]): number {
    if (sentimentData.length < 2) return 0;

    const regression = this.linearRegression(
      sentimentData.map((_, i) => i),
      sentimentData.map(d => d.sentiment)
    );

    return regression.slope;
  }

  private calculateSeasonalFactor(sentimentData: SentimentData[], hour: number): number {
    // Simple seasonal pattern based on hour of day
    const hourOfDay = (new Date().getHours() + hour) % 24;
    return Math.sin((hourOfDay / 24) * 2 * Math.PI) * 0.1;
  }

  private calculateMarketInfluence(marketData: MarketData[], correlation: CorrelationResult): number {
    if (marketData.length < 2) return 0;

    const recentPrice = marketData[marketData.length - 1].close;
    const previousPrice = marketData[marketData.length - 2].close;
    const priceChange = (recentPrice - previousPrice) / previousPrice;

    // Invert if correlation is negative
    return correlation.correlation * priceChange * 0.5;
  }

  private applyFactors(
    trend: number,
    seasonal: number,
    market: number,
    weights: number[]
  ): number {
    const recentSentiment = weights.reduce((sum, weight, i) => sum + weight * (0.1 - 0.2), 0);
    return recentSentiment + trend * 0.4 + seasonal * 0.2 + market * 0.3;
  }

  private predictPriceFromSentiment(sentiment: number, correlation: CorrelationResult): number {
    const basePrice = 100; // Normalized base price
    return basePrice * (1 + correlation.coefficient * sentiment);
  }

  private calculateModelAccuracy(correlation: CorrelationResult): number {
    return Math.max(0.5, Math.abs(correlation.rSquared));
  }

  private calculateMomentum(sentimentData: SentimentData[]): number {
    if (sentimentData.length < 3) return 0;

    const recent = sentimentData.slice(-3);
    return (recent[2].sentiment - recent[0].sentiment) / 2;
  }

  getSentimentHeatmap(
    sentimentData: SentimentData[],
    marketData: MarketData[],
    gridSize: number = 20
  ): Array<{ x: number; y: number; intensity: number; timestamp: Date }> {
    const heatmap: Array<{ x: number; y: number; intensity: number; timestamp: Date }> = [];

    sentimentData.forEach((sentiment, i) => {
      const marketPoint = this.findClosestMarketPoint(marketData, sentiment.timestamp);
      if (marketPoint) {
        const x = (sentiment.sentiment + 1) * gridSize / 2; // Normalize sentiment to 0-gridSize
        const y = ((marketPoint.close % 100) / 100) * gridSize; // Normalize price to 0-gridSize
        const intensity = Math.abs(sentiment.sentiment) * sentiment.confidence;

        heatmap.push({
          x: Math.floor(x),
          y: Math.floor(y),
          intensity,
          timestamp: sentiment.timestamp
        });
      }
    });

    return heatmap;
  }

  private findClosestMarketPoint(marketData: MarketData[], targetTime: Date): MarketData | null {
    let closest: MarketData | null = null;
    let minDiff = Infinity;

    marketData.forEach(point => {
      const diff = Math.abs(point.timestamp.getTime() - targetTime.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closest = point;
      }
    });

    return closest;
  }
}

export default MarketCorrelationService.getInstance();
