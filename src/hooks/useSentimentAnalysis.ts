import { useState, useEffect, useCallback, useRef } from 'react';
import SocialMediaMonitoringService, { SocialMediaMetrics, SocialMediaPost, InfluencerData } from '../services/sentiment/social-monitoring';
import NewsAnalyzerService, { NewsArticle, NewsSentimentMetrics } from '../services/sentiment/news-analyzer';
import MarketCorrelationService, { MarketData, SentimentData, MarketSentimentSignal, SentimentPrediction } from '../utils/sentiment/market-correlation';

export interface SentimentAnalysisState {
  socialMedia: {
    metrics: SocialMediaMetrics[];
    posts: SocialMediaPost[];
    influencers: InfluencerData[];
    isLoading: boolean;
    error: string | null;
  };
  news: {
    metrics: NewsSentimentMetrics | null;
    articles: NewsArticle[];
    isLoading: boolean;
    error: string | null;
  };
  market: {
    signals: MarketSentimentSignal[];
    predictions: SentimentPrediction[];
    correlation: any;
    isLoading: boolean;
    error: string | null;
  };
  overall: {
    sentiment: number;
    confidence: number;
    trend: 'bullish' | 'bearish' | 'neutral';
    strength: 'weak' | 'moderate' | 'strong';
    lastUpdated: Date;
  };
}

export interface SentimentAnalysisOptions {
  keywords: string[];
  platforms: string[];
  languages: string[];
  timeWindow: number; // hours
  updateInterval: number; // seconds
  enableRealTime: boolean;
  enablePredictions: boolean;
  threshold: number;
}

const defaultOptions: SentimentAnalysisOptions = {
  keywords: ['energy', 'oil', 'gas', 'renewable', 'solar', 'wind'],
  platforms: ['twitter', 'reddit', 'telegram', 'discord'],
  languages: ['en', 'es', 'zh', 'ar'],
  timeWindow: 24,
  updateInterval: 300, // 5 minutes
  enableRealTime: true,
  enablePredictions: true,
  threshold: 0.3
};

export const useSentimentAnalysis = (options: Partial<SentimentAnalysisOptions> = {}) => {
  const [state, setState] = useState<SentimentAnalysisState>({
    socialMedia: {
      metrics: [],
      posts: [],
      influencers: [],
      isLoading: false,
      error: null
    },
    news: {
      metrics: null,
      articles: [],
      isLoading: false,
      error: null
    },
    market: {
      signals: [],
      predictions: [],
      correlation: null,
      isLoading: false,
      error: null
    },
    overall: {
      sentiment: 0,
      confidence: 0,
      trend: 'neutral',
      strength: 'weak',
      lastUpdated: new Date()
    }
  });

  const config = { ...defaultOptions, ...options };
  const intervalRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  const initializeServices = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        socialMedia: { ...prev.socialMedia, isLoading: true },
        news: { ...prev.news, isLoading: true },
        market: { ...prev.market, isLoading: true }
      }));

      await SocialMediaMonitoringService.initializeMonitoring(config.platforms);
      await NewsAnalyzerService.initializeSources();

      isInitializedRef.current = true;
      
      // Initial data fetch
      await fetchAllSentimentData();
    } catch (error) {
      console.error('Failed to initialize sentiment analysis services:', error);
      setState(prev => ({
        ...prev,
        socialMedia: { ...prev.socialMedia, error: 'Failed to initialize social media monitoring' },
        news: { ...prev.news, error: 'Failed to initialize news analyzer' },
        market: { ...prev.market, error: 'Failed to initialize market correlation' }
      }));
    } finally {
      setState(prev => ({
        ...prev,
        socialMedia: { ...prev.socialMedia, isLoading: false },
        news: { ...prev.news, isLoading: false },
        market: { ...prev.market, isLoading: false }
      }));
    }
  }, [config.platforms]);

  const fetchAllSentimentData = useCallback(async () => {
    if (!isInitializedRef.current) return;

    try {
      // Fetch social media data
      const socialMetrics = await SocialMediaMonitoringService.trackEnergySentiment(
        config.keywords,
        config.platforms
      );

      const influencersPromises = config.platforms.map(platform => 
          SocialMediaMonitoringService.getInfluencerSentiment(platform, 'energy')
        );
      const influencersResults = await Promise.all(influencersPromises);
      const influencers = influencersResults.reduce((acc, curr) => acc.concat(curr), []);

      // Fetch news data
      const newsMetrics = await NewsAnalyzerService.analyzeNewsSentiment(
        config.keywords,
        config.timeWindow
      );

      const topArticles = await NewsAnalyzerService.getTopInfluentialArticles(
        config.keywords,
        config.timeWindow,
        20
      );

      // Generate market signals and predictions
      const mockMarketData = generateMockMarketData();
      const mockSentimentData = generateMockSentimentData();

      const correlation = MarketCorrelationService.calculateCorrelation(
        mockMarketData,
        mockSentimentData
      );

      const signals = MarketCorrelationService.generateSentimentSignals(
        mockMarketData,
        mockSentimentData,
        config.threshold
      );

      let predictions: SentimentPrediction[] = [];
      if (config.enablePredictions) {
        predictions = MarketCorrelationService.predictMarketSentiment(
          mockSentimentData,
          mockMarketData,
          24
        );
      }

      // Calculate overall sentiment
      const overallSentiment = calculateOverallSentiment(
        socialMetrics,
        newsMetrics,
        signals
      );

      setState(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          metrics: socialMetrics,
          influencers,
          isLoading: false,
          error: null
        },
        news: {
          ...prev.news,
          metrics: newsMetrics,
          articles: topArticles,
          isLoading: false,
          error: null
        },
        market: {
          ...prev.market,
          signals,
          predictions,
          correlation,
          isLoading: false,
          error: null
        },
        overall: overallSentiment
      }));
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
      setState(prev => ({
        ...prev,
        socialMedia: { ...prev.socialMedia, error: 'Failed to fetch social media data' },
        news: { ...prev.news, error: 'Failed to fetch news data' },
        market: { ...prev.market, error: 'Failed to generate market analysis' }
      }));
    }
  }, [config.keywords, config.platforms, config.timeWindow, config.threshold, config.enablePredictions]);

  const calculateOverallSentiment = (
    socialMetrics: SocialMediaMetrics[],
    newsMetrics: NewsSentimentMetrics | null,
    signals: MarketSentimentSignal[]
  ): SentimentAnalysisState['overall'] => {
    const socialSentiment = socialMetrics.length > 0
      ? socialMetrics.reduce((sum, m) => sum + m.sentimentScore, 0) / socialMetrics.length
      : 0;

    const newsSentiment = newsMetrics ? newsMetrics.averageSentiment : 0;
    
    const signalSentiment = signals.length > 0
      ? signals.reduce((sum, s) => sum + (s.signal === 'buy' ? 1 : s.signal === 'sell' ? -1 : 0), 0) / signals.length
      : 0;

    // Weighted average
    const overallSentiment = (socialSentiment * 0.4 + newsSentiment * 0.4 + signalSentiment * 0.2);
    const confidence = Math.min(0.95, 0.7 + (socialMetrics.length + (newsMetrics?.totalArticles || 0)) / 1000);

    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let strength: 'weak' | 'moderate' | 'strong' = 'weak';

    if (overallSentiment > 0.1) {
      trend = 'bullish';
      strength = overallSentiment > 0.5 ? 'strong' : overallSentiment > 0.3 ? 'moderate' : 'weak';
    } else if (overallSentiment < -0.1) {
      trend = 'bearish';
      strength = overallSentiment < -0.5 ? 'strong' : overallSentiment < -0.3 ? 'moderate' : 'weak';
    }

    return {
      sentiment: overallSentiment,
      confidence,
      trend,
      strength,
      lastUpdated: new Date()
    };
  };

  const generateMockMarketData = (): MarketData[] => {
    const data: MarketData[] = [];
    const now = new Date();
    
    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const basePrice = 100;
      const variation = (Math.random() - 0.5) * 10;
      const price = basePrice + variation;
      
      data.push({
        timestamp,
        price,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        high: price + Math.random() * 2,
        low: price - Math.random() * 2,
        open: price + (Math.random() - 0.5) * 1,
        close: price
      });
    }
    
    return data.reverse();
  };

  const generateMockSentimentData = (): SentimentData[] => {
    const data: SentimentData[] = [];
    const now = new Date();
    
    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      data.push({
        timestamp,
        sentiment: (Math.random() - 0.5) * 2,
        confidence: Math.random() * 0.3 + 0.7,
        volume: Math.floor(Math.random() * 1000) + 100,
        source: config.platforms[Math.floor(Math.random() * config.platforms.length)]
      });
    }
    
    return data.reverse();
  };

  const refreshData = useCallback(() => {
    fetchAllSentimentData();
  }, [fetchAllSentimentData]);

  const updateKeywords = useCallback((newKeywords: string[]) => {
    config.keywords = newKeywords;
    refreshData();
  }, [refreshData]);

  const updatePlatforms = useCallback((newPlatforms: string[]) => {
    config.platforms = newPlatforms;
    refreshData();
  }, [refreshData]);

  const getSentimentByPlatform = useCallback((platform: string) => {
    return state.socialMedia.metrics.find(m => m.platform === platform);
  }, [state.socialMedia.metrics]);

  const getTopInfluencers = useCallback((limit: number = 10) => {
    return state.socialMedia.influencers
      .sort((a, b) => b.influenceScore - a.influenceScore)
      .slice(0, limit);
  }, [state.socialMedia.influencers]);

  const getRecentSignals = useCallback((hours: number = 24) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return state.market.signals.filter(s => s.timestamp >= cutoff);
  }, [state.market.signals]);

  const getPredictions = useCallback((hours: number = 24) => {
    return state.market.predictions.filter(p => p.predictionHorizon <= hours);
  }, [state.market.predictions]);

  const exportSentimentData = useCallback(() => {
    return {
      timestamp: new Date(),
      config,
      state,
      exportVersion: '1.0'
    };
  }, [config, state]);

  useEffect(() => {
    initializeServices();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      SocialMediaMonitoringService.disconnect();
    };
  }, [initializeServices]);

  useEffect(() => {
    if (config.enableRealTime && isInitializedRef.current) {
      intervalRef.current = setInterval(() => {
        fetchAllSentimentData();
      }, config.updateInterval * 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [config.enableRealTime, config.updateInterval, fetchAllSentimentData]);

  return {
    ...state,
    config,
    refreshData,
    updateKeywords,
    updatePlatforms,
    getSentimentByPlatform,
    getTopInfluencers,
    getRecentSignals,
    getPredictions,
    exportSentimentData,
    isInitialized: isInitializedRef.current
  };
};
