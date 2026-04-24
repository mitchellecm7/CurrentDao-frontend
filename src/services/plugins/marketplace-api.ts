export interface MarketplacePlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  rating: number;
  reviewsCount: number;
  category: string;
  icon?: string;
  price?: number;
  downloads: number;
}

export const fetchMarketplacePlugins = async (query?: string, category?: string): Promise<MarketplacePlugin[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'trading-bot-pro',
          name: 'Trading Bot Pro',
          version: '2.1.0',
          description: 'Advanced automated trading strategies with AI-powered market analysis.',
          author: 'Quantum Labs',
          rating: 4.8,
          reviewsCount: 1240,
          category: 'Trading',
          icon: '🤖',
          downloads: 15000,
        },
        // ... more plugins
      ]);
    }, 500);
  });
};

export const getPluginDetails = async (id: string): Promise<MarketplacePlugin | null> => {
  // Simulate API call
  return null;
};

export const submitPluginReview = async (id: string, rating: number, comment: string): Promise<void> => {
  console.log(`Submitting review for ${id}: ${rating} stars - ${comment}`);
};
