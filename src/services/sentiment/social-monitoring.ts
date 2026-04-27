export interface SocialMediaPost {
  id: string;
  platform: string;
  content: string;
  author: string;
  timestamp: Date;
  likes: number;
  shares: number;
  comments: number;
  sentiment: number;
  confidence: number;
  language: string;
  hashtags: string[];
  mentions: string[];
  url?: string;
  isVerified: boolean;
  followerCount: number;
  engagement: number;
}

export interface SocialMediaMetrics {
  platform: string;
  totalPosts: number;
  sentimentScore: number;
  volume: number;
  engagement: number;
  reach: number;
  trending: boolean;
  keywords: string[];
  timestamp: Date;
}

export interface InfluencerData {
  id: string;
  name: string;
  platform: string;
  followers: number;
  engagement: number;
  sentiment: number;
  credibility: number;
  recentPosts: SocialMediaPost[];
  influenceScore: number;
  expertise: string[];
  lastActive: Date;
}

export class SocialMediaMonitoringService {
  private static instance: SocialMediaMonitoringService;
  private wsConnections: { [key: string]: WebSocket } = {};
  private cache: { [key: string]: any } = {};
  private readonly API_ENDPOINTS = {
    twitter: 'https://api.twitter.com/2',
    reddit: 'https://oauth.reddit.com',
    telegram: 'https://api.telegram.org/bot',
    facebook: 'https://graph.facebook.com/v18.0',
    instagram: 'https://graph.instagram.com',
    linkedin: 'https://api.linkedin.com/v2',
    youtube: 'https://www.googleapis.com/youtube/v3',
    tiktok: 'https://open-api.tiktok.com',
    weibo: 'https://api.weibo.com/2',
    discord: 'https://discord.com/api/v10'
  };

  static getInstance(): SocialMediaMonitoringService {
    if (!SocialMediaMonitoringService.instance) {
      SocialMediaMonitoringService.instance = new SocialMediaMonitoringService();
    }
    return SocialMediaMonitoringService.instance;
  }

  async initializeMonitoring(platforms: string[]): Promise<void> {
    for (const platform of platforms) {
      await this.connectToPlatform(platform);
    }
  }

  private async connectToPlatform(platform: string): Promise<void> {
    try {
      const wsUrl = this.getWebSocketUrl(platform);
      if (wsUrl) {
        const ws = new WebSocket(wsUrl);
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.handleRealtimeData(platform, data);
        };
        this.wsConnections[platform] = ws;
      }
    } catch (error) {
      console.error(`Failed to connect to ${platform}:`, error);
    }
  }

  private getWebSocketUrl(platform: string): string | null {
    const wsUrls = {
      twitter: 'wss://stream.twitter.com/1.1/statuses/filter.json',
      reddit: 'wss://wss.redditmedia.com',
      discord: 'wss://gateway.discord.gg',
      telegram: 'wss://api.telegram.org/bot'
    };
    return wsUrls[platform as keyof typeof wsUrls] || null;
  }

  async trackEnergySentiment(keywords: string[], platforms: string[]): Promise<SocialMediaMetrics[]> {
    const metrics: SocialMediaMetrics[] = [];
    
    for (const platform of platforms) {
      try {
        const platformMetrics = await this.getPlatformMetrics(platform, keywords);
        metrics.push(platformMetrics);
      } catch (error) {
        console.error(`Error tracking ${platform}:`, error);
      }
    }

    return metrics;
  }

  private async getPlatformMetrics(platform: string, keywords: string[]): Promise<SocialMediaMetrics> {
    const cacheKey = `${platform}_${keywords.join('_')}`;
    if (this.cache[cacheKey]) {
      const cached = this.cache[cacheKey];
      if (Date.now() - cached.timestamp < 300000) { // 5 min cache
        return cached.data;
      }
    }

    const metrics = await this.fetchPlatformData(platform, keywords);
    this.cache[cacheKey] = { data: metrics, timestamp: Date.now() };
    
    return metrics;
  }

  private async fetchPlatformData(platform: string, keywords: string[]): Promise<SocialMediaMetrics> {
    // Simulate API calls - in production, integrate with actual platform APIs
    const mockData = this.generateMockMetrics(platform, keywords);
    return mockData;
  }

  private generateMockMetrics(platform: string, keywords: string[]): SocialMediaMetrics {
    const baseSentiment = Math.random() * 0.6 - 0.3; // -0.3 to 0.3
    const volume = Math.floor(Math.random() * 10000) + 1000;
    
    return {
      platform,
      totalPosts: volume,
      sentimentScore: baseSentiment + (Math.random() * 0.2 - 0.1),
      volume,
      engagement: Math.random() * 100,
      reach: volume * (Math.random() * 10 + 5),
      trending: Math.random() > 0.7,
      keywords: keywords.slice(0, 5),
      timestamp: new Date()
    };
  }

  async analyzeSentiment(text: string, language: string = 'en'): Promise<{ sentiment: number; confidence: number }> {
    // Simulate sentiment analysis - in production, use ML models
    const positiveWords = ['good', 'great', 'excellent', 'positive', 'growth', 'bullish', 'up', 'rise'];
    const negativeWords = ['bad', 'terrible', 'negative', 'decline', 'bearish', 'down', 'fall', 'crisis'];
    
    const words = text.toLowerCase().split(' ');
    let sentiment = 0;
    
    words.forEach(word => {
      if (positiveWords.indexOf(word) !== -1) sentiment += 0.1;
      if (negativeWords.indexOf(word) !== -1) sentiment -= 0.1;
    });
    
    sentiment = Math.max(-1, Math.min(1, sentiment));
    const confidence = Math.random() * 0.3 + 0.7; // 0.7 to 1.0
    
    return { sentiment, confidence };
  }

  async getInfluencerSentiment(platform: string, category: string = 'energy'): Promise<InfluencerData[]> {
    const influencers = await this.fetchInfluencers(platform, category);
    return influencers.map(influencer => ({
      ...influencer,
      influenceScore: this.calculateInfluenceScore(influencer)
    }));
  }

  private async fetchInfluencers(platform: string, category: string): Promise<InfluencerData[]> {
    // Mock data - in production, fetch from platform APIs
    return [
      {
        id: '1',
        name: 'Energy Expert',
        platform,
        followers: 100000,
        engagement: 85,
        sentiment: 0.3,
        credibility: 0.9,
        recentPosts: [],
        influenceScore: 0,
        expertise: ['energy', 'renewable', 'oil'],
        lastActive: new Date()
      }
    ];
  }

  private calculateInfluenceScore(influencer: InfluencerData): number {
    const followerWeight = 0.3;
    const engagementWeight = 0.4;
    const credibilityWeight = 0.3;
    
    return (
      (influencer.followers / 1000000) * followerWeight +
      (influencer.engagement / 100) * engagementWeight +
      influencer.credibility * credibilityWeight
    );
  }

  async getTrendingTopics(platform: string, timeWindow: number = 3600000): Promise<string[]> {
    // Mock trending topics
    return [
      'renewable energy',
      'oil prices',
      'solar power',
      'wind energy',
      'energy storage',
      'electric vehicles',
      'carbon credits',
      'energy policy'
    ];
  }

  private handleRealtimeData(platform: string, data: any): void {
    // Process real-time data from WebSocket connections
    const post = this.parseSocialMediaPost(platform, data);
    if (post) {
      this.broadcastUpdate(post);
    }
  }

  private parseSocialMediaPost(platform: string, data: any): SocialMediaPost | null {
    // Parse platform-specific data into standardized format
    try {
      return {
        id: data.id || '',
        platform,
        content: data.text || data.content || '',
        author: data.user?.name || data.author || '',
        timestamp: new Date(data.created_at || data.timestamp),
        likes: data.like_count || data.likes || 0,
        shares: data.share_count || data.shares || 0,
        comments: data.comment_count || data.comments || 0,
        sentiment: 0,
        confidence: 0,
        language: data.lang || 'en',
        hashtags: data.hashtags || [],
        mentions: data.mentions || [],
        url: data.url,
        isVerified: data.user?.verified || false,
        followerCount: data.user?.followers_count || 0,
        engagement: 0
      };
    } catch (error) {
      return null;
    }
  }

  private broadcastUpdate(post: SocialMediaPost): void {
    // Broadcast updates to connected clients
    this.analyzeSentiment(post.content, post.language).then(sentiment => {
      post.sentiment = sentiment.sentiment;
      post.confidence = sentiment.confidence;
    });
  }

  async getHistoricalSentiment(
    platform: string, 
    startDate: Date, 
    endDate: Date, 
    keywords: string[]
  ): Promise<{ timestamp: Date; sentiment: number; volume: number }[]> {
    // Generate mock historical data
    const data: { timestamp: Date; sentiment: number; volume: number }[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      data.push({
        timestamp: new Date(current),
        sentiment: Math.random() * 0.6 - 0.3,
        volume: Math.floor(Math.random() * 1000) + 100
      });
      current.setHours(current.getHours() + 1);
    }
    
    return data;
  }

  disconnect(): void {
    Object.keys(this.wsConnections).forEach(key => {
      this.wsConnections[key].close();
    });
    this.wsConnections = {};
  }
}

export default SocialMediaMonitoringService.getInstance();
