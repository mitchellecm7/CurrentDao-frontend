export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  source: string;
  author: string;
  publishedAt: Date;
  url: string;
  category: string;
  tags: string[];
  language: string;
  sentiment: number;
  confidence: number;
  relevanceScore: number;
  credibility: number;
  readTime: number;
  shareCount: number;
  commentCount: number;
}

export interface NewsSentimentMetrics {
  totalArticles: number;
  averageSentiment: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  topSources: Array<{
    source: string;
    articleCount: number;
    averageSentiment: number;
    credibility: number;
  }>;
  trendingTopics: Array<{
    topic: string;
    mentionCount: number;
    averageSentiment: number;
    trendDirection: 'up' | 'down' | 'stable';
  }>;
  timeRange: {
    start: Date;
    end: Date;
  };
  lastUpdated: Date;
}

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  country: string;
  language: string;
  credibility: number;
  bias: 'left' | 'right' | 'center' | 'unknown';
  category: string[];
  lastCrawled: Date;
  articleCount: number;
  averageSentiment: number;
}

export class NewsAnalyzerService {
  private static instance: NewsAnalyzerService;
  private cache: { [key: string]: any } = {};
  private newsSources: NewsSource[] = [];
  private readonly NEWS_APIS = {
    newsapi: 'https://newsapi.org/v2',
    guardian: 'https://content.guardianapis.com',
    nytimes: 'https://api.nytimes.com/svc/search/v2',
    reuters: 'https://api.reuters.com',
    bloomberg: 'https://api.bloomberg.com',
    financialtimes: 'https://api.ft.com',
    wsj: 'https://api.wsj.com',
    cnbc: 'https://api.cnbc.com',
    marketwatch: 'https://api.marketwatch.com',
    seekingalpha: 'https://api.seekingalpha.com'
  };

  static getInstance(): NewsAnalyzerService {
    if (!NewsAnalyzerService.instance) {
      NewsAnalyzerService.instance = new NewsAnalyzerService();
    }
    return NewsAnalyzerService.instance;
  }

  async initializeSources(): Promise<void> {
    this.newsSources = [
      {
        id: 'reuters',
        name: 'Reuters',
        url: 'https://reuters.com',
        country: 'US',
        language: 'en',
        credibility: 0.9,
        bias: 'center',
        category: ['energy', 'business', 'markets'],
        lastCrawled: new Date(),
        articleCount: 0,
        averageSentiment: 0
      },
      {
        id: 'bloomberg',
        name: 'Bloomberg',
        url: 'https://bloomberg.com',
        country: 'US',
        language: 'en',
        credibility: 0.85,
        bias: 'center',
        category: ['energy', 'finance', 'markets'],
        lastCrawled: new Date(),
        articleCount: 0,
        averageSentiment: 0
      },
      {
        id: 'financial-times',
        name: 'Financial Times',
        url: 'https://ft.com',
        country: 'UK',
        language: 'en',
        credibility: 0.88,
        bias: 'center',
        category: ['energy', 'business', 'economy'],
        lastCrawled: new Date(),
        articleCount: 0,
        averageSentiment: 0
      },
      {
        id: 'cnbc',
        name: 'CNBC',
        url: 'https://cnbc.com',
        country: 'US',
        language: 'en',
        credibility: 0.75,
        bias: 'center',
        category: ['energy', 'markets', 'business'],
        lastCrawled: new Date(),
        articleCount: 0,
        averageSentiment: 0
      }
    ];
  }

  async analyzeNewsSentiment(keywords: string[], timeWindow: number = 24): Promise<NewsSentimentMetrics> {
    const cacheKey = `news_sentiment_${keywords.join('_')}_${timeWindow}`;
    
    if (this.cache[cacheKey]) {
      const cached = this.cache[cacheKey];
      if (Date.now() - cached.timestamp < 1800000) { // 30 min cache
        return cached.data;
      }
    }

    const articles = await this.fetchNewsArticles(keywords, timeWindow);
    const metrics = this.calculateSentimentMetrics(articles, keywords);
    
    this.cache[cacheKey] = { data: metrics, timestamp: Date.now() };
    return metrics;
  }

  private async fetchNewsArticles(keywords: string[], timeWindow: number): Promise<NewsArticle[]> {
    const articles: NewsArticle[] = [];
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - timeWindow * 60 * 60 * 1000);

    for (const source of this.newsSources) {
      try {
        const sourceArticles = await this.fetchFromSource(source, keywords, startDate, endDate);
        articles.push(...sourceArticles);
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error);
      }
    }

    return articles;
  }

  private async fetchFromSource(
    source: NewsSource,
    keywords: string[],
    startDate: Date,
    endDate: Date
  ): Promise<NewsArticle[]> {
    // Mock implementation - in production, integrate with actual news APIs
    const mockArticles = this.generateMockArticles(source, keywords, startDate, endDate);
    return mockArticles;
  }

  private generateMockArticles(
    source: NewsSource,
    keywords: string[],
    startDate: Date,
    endDate: Date
  ): NewsArticle[] {
    const articleCount = Math.floor(Math.random() * 50) + 10;
    const articles: NewsArticle[] = [];

    for (let i = 0; i < articleCount; i++) {
      const article: NewsArticle = {
        id: `${source.id}_${i}`,
        title: this.generateMockTitle(keywords),
        content: this.generateMockContent(keywords),
        summary: this.generateMockSummary(keywords),
        source: source.name,
        author: `Author ${i}`,
        publishedAt: new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())),
        url: `https://${source.url}/article/${i}`,
        category: 'energy',
        tags: keywords.slice(0, 3),
        language: source.language,
        sentiment: 0,
        confidence: 0,
        relevanceScore: Math.random() * 0.5 + 0.5,
        credibility: source.credibility,
        readTime: Math.floor(Math.random() * 5) + 2,
        shareCount: Math.floor(Math.random() * 1000),
        commentCount: Math.floor(Math.random() * 100)
      };

      const sentiment = this.analyzeArticleSentiment(article);
      article.sentiment = sentiment.sentiment;
      article.confidence = sentiment.confidence;

      articles.push(article);
    }

    return articles;
  }

  private generateMockTitle(keywords: string[]): string {
    const templates = [
      `${keywords[0]} Prices ${Math.random() > 0.5 ? 'Rise' : 'Fall'} Amid Market Volatility`,
      `New ${keywords[0]} Policy ${Math.random() > 0.5 ? 'Announced' : 'Delayed'}`,
      `${keywords[0]} Industry Reports ${Math.random() > 0.5 ? 'Growth' : 'Decline'}`,
      `Breaking: ${keywords[0]} Market Update`,
      `Experts Discuss ${keywords[0]} Future`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateMockContent(keywords: string[]): string {
    const sentences = [
      `The ${keywords[0]} sector has experienced significant changes recently.`,
      `Market analysts predict continued volatility in ${keywords[0]} markets.`,
      `Government policies regarding ${keywords[0]} are evolving rapidly.`,
      `Investor sentiment towards ${keywords[0]} remains mixed.`,
      `Technical indicators suggest ${Math.random() > 0.5 ? 'bullish' : 'bearish'} trends for ${keywords[0]}.`
    ];
    return sentences.join(' ');
  }

  private generateMockSummary(keywords: string[]): string {
    return `Recent developments in ${keywords[0]} markets show ${Math.random() > 0.5 ? 'positive' : 'negative'} trends.`;
  }

  private calculateSentimentMetrics(articles: NewsArticle[], keywords: string[]): NewsSentimentMetrics {
    const totalArticles = articles.length;
    const sentiments = articles.map(a => a.sentiment);
    const averageSentiment = sentiments.reduce((sum, s) => sum + s, 0) / totalArticles;

    const sentimentDistribution = {
      positive: articles.filter(a => a.sentiment > 0.1).length,
      negative: articles.filter(a => a.sentiment < -0.1).length,
      neutral: articles.filter(a => Math.abs(a.sentiment) <= 0.1).length
    };

    const sourceGroups = this.groupBySource(articles);
    const topSources = Object.entries(sourceGroups)
      .map(([source, sourceArticles]) => ({
        source,
        articleCount: sourceArticles.length,
        averageSentiment: sourceArticles.reduce((sum, a) => sum + a.sentiment, 0) / sourceArticles.length,
        credibility: sourceArticles[0].credibility
      }))
      .sort((a, b) => b.articleCount - a.articleCount)
      .slice(0, 5);

    const trendingTopics = this.calculateTrendingTopics(articles, keywords);

    return {
      totalArticles,
      averageSentiment,
      sentimentDistribution,
      topSources,
      trendingTopics,
      timeRange: {
        start: new Date(Math.min(...articles.map(a => a.publishedAt.getTime()))),
        end: new Date(Math.max(...articles.map(a => a.publishedAt.getTime())))
      },
      lastUpdated: new Date()
    };
  }

  private groupBySource(articles: NewsArticle[]): { [source: string]: NewsArticle[] } {
    const groups: { [source: string]: NewsArticle[] } = {};
    
    articles.forEach(article => {
      if (!groups[article.source]) {
        groups[article.source] = [];
      }
      groups[article.source].push(article);
    });

    return groups;
  }

  private calculateTrendingTopics(articles: NewsArticle[], keywords: string[]): Array<{
    topic: string;
    mentionCount: number;
    averageSentiment: number;
    trendDirection: 'up' | 'down' | 'stable';
  }> {
    const topicCounts: { [topic: string]: { count: number; sentiments: number[] } } = {};

    articles.forEach(article => {
      article.tags.forEach(tag => {
        if (!topicCounts[tag]) {
          topicCounts[tag] = { count: 0, sentiments: [] };
        }
        topicCounts[tag].count++;
        topicCounts[tag].sentiments.push(article.sentiment);
      });
    });

    return Object.entries(topicCounts)
      .map(([topic, data]) => ({
        topic,
        mentionCount: data.count,
        averageSentiment: data.sentiments.reduce((sum, s) => sum + s, 0) / data.sentiments.length,
        trendDirection: (Math.random() > 0.66 ? 'up' : Math.random() > 0.33 ? 'stable' : 'down') as 'up' | 'down' | 'stable'
      }))
      .sort((a, b) => b.mentionCount - a.mentionCount)
      .slice(0, 10);
  }

  analyzeArticleSentiment(article: NewsArticle): { sentiment: number; confidence: number } {
    const text = `${article.title} ${article.content}`;
    return this.analyzeTextSentiment(text, article.language);
  }

  private analyzeTextSentiment(text: string, language: string = 'en'): { sentiment: number; confidence: number } {
    // Enhanced sentiment analysis with multi-language support
    const sentimentLexicon = this.getSentimentLexicon(language);
    const words = text.toLowerCase().split(/\s+/);
    
    let sentiment = 0;
    let wordCount = 0;

    words.forEach(word => {
      if (sentimentLexicon.positive.indexOf(word) !== -1) {
        sentiment += 1;
        wordCount++;
      } else if (sentimentLexicon.negative.indexOf(word) !== -1) {
        sentiment -= 1;
        wordCount++;
      }
    });

    if (wordCount === 0) {
      return { sentiment: 0, confidence: 0.5 };
    }

    const normalizedSentiment = Math.max(-1, Math.min(1, sentiment / Math.sqrt(wordCount)));
    const confidence = Math.min(0.95, 0.5 + (wordCount / 100) * 0.45);

    return { sentiment: normalizedSentiment, confidence };
  }

  private getSentimentLexicon(language: string): { positive: string[]; negative: string[] } {
    const lexicons: { [lang: string]: { positive: string[]; negative: string[] } } = {
      en: {
        positive: ['good', 'great', 'excellent', 'positive', 'growth', 'bullish', 'up', 'rise', 'increase', 'profit', 'success', 'strong', 'robust', 'optimistic'],
        negative: ['bad', 'terrible', 'negative', 'decline', 'bearish', 'down', 'fall', 'decrease', 'loss', 'failure', 'weak', 'poor', 'pessimistic', 'crisis']
      },
      es: {
        positive: ['bueno', 'excelente', 'positivo', 'crecimiento', 'alcista', 'subir', 'aumento', 'ganancia', 'éxito', 'fuerte', 'optimista'],
        negative: ['malo', 'terrible', 'negativo', 'declive', 'bajista', 'bajar', 'disminución', 'pérdida', 'fracaso', 'débil', 'pesimista']
      },
      zh: {
        positive: ['好', '优秀', '积极', '增长', '看涨', '上升', '增加', '利润', '成功', '强劲', '乐观'],
        negative: ['坏', '糟糕', '消极', '下降', '看跌', '下跌', '减少', '损失', '失败', '疲软', '悲观']
      },
      ar: {
        positive: ['جيد', 'ممتاز', 'إيجابي', 'نمو', 'صعودي', 'ارتفاع', 'زيادة', 'ربح', 'نجاح', 'قوي', 'متفائل'],
        negative: ['سيء', 'رهيب', 'سلبي', 'انخفاض', 'هبوطي', 'هبوط', 'نقصان', 'خسارة', 'فشل', 'ضعيف', 'متشائم']
      }
    };

    return lexicons[language] || lexicons.en;
  }

  async getHistoricalNewsSentiment(
    keywords: string[],
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ date: Date; sentiment: number; articleCount: number }>> {
    const data: Array<{ date: Date; sentiment: number; articleCount: number }> = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayArticles = await this.fetchNewsArticles(keywords, 24);
      const daySentiment = dayArticles.reduce((sum, a) => sum + a.sentiment, 0) / dayArticles.length;
      
      data.push({
        date: new Date(current),
        sentiment: daySentiment || 0,
        articleCount: dayArticles.length
      });

      current.setDate(current.getDate() + 1);
    }

    return data;
  }

  async getTopInfluentialArticles(
    keywords: string[],
    timeWindow: number = 24,
    limit: number = 10
  ): Promise<NewsArticle[]> {
    const articles = await this.fetchNewsArticles(keywords, timeWindow);
    
    return articles
      .sort((a, b) => {
        const scoreA = a.relevanceScore * a.credibility * (a.shareCount + a.commentCount * 0.1);
        const scoreB = b.relevanceScore * b.credibility * (b.shareCount + b.commentCount * 0.1);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  async detectSentimentAnomalies(
    keywords: string[],
    threshold: number = 2.0
  ): Promise<Array<{ article: NewsArticle; anomalyScore: number; reason: string }>> {
    const articles = await this.fetchNewsArticles(keywords, 24);
    const anomalies: Array<{ article: NewsArticle; anomalyScore: number; reason: string }> = [];

    const avgSentiment = articles.reduce((sum, a) => sum + a.sentiment, 0) / articles.length;
    const stdDev = Math.sqrt(
      articles.reduce((sum, a) => sum + Math.pow(a.sentiment - avgSentiment, 2), 0) / articles.length
    );

    articles.forEach(article => {
      const zScore = Math.abs(article.sentiment - avgSentiment) / stdDev;
      if (zScore > threshold) {
        anomalies.push({
          article,
          anomalyScore: zScore,
          reason: `Sentiment deviation of ${zScore.toFixed(2)} standard deviations from mean`
        });
      }
    });

    return anomalies.sort((a, b) => b.anomalyScore - a.anomalyScore);
  }
}

export default NewsAnalyzerService.getInstance();
