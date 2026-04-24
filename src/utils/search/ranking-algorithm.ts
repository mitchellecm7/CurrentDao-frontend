import { SearchableItem, SearchQuery } from '@/types/search';

export function rankingAlgorithm(item: SearchableItem, query: SearchQuery): number {
  let score = 0;
  
  // Base relevance score
  score += calculateTextRelevance(item, query.text || '');
  
  // Recency boost (newer items get higher scores)
  score += calculateRecencyBoost(item.timestamp);
  
  // Rating boost
  score += calculateRatingBoost(item.metadata.rating);
  
  // Popularity boost
  score += calculatePopularityBoost(item.metadata);
  
  // Type-specific scoring
  score += calculateTypeScore(item.type, query);
  
  // Filter match boost
  score += calculateFilterMatchBoost(item, query.filters || []);
  
  // Tag relevance
  score += calculateTagRelevance(item.tags, query.text || '');
  
  return Math.min(score, 10); // Cap at 10 for normalization
}

function calculateTextRelevance(item: SearchableItem, query: string): number {
  if (!query) return 0;
  
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const titleWords = item.title.toLowerCase().split(/\s+/);
  const contentWords = item.content.toLowerCase().split(/\s+/);
  const tagWords = item.tags.join(' ').toLowerCase().split(/\s+/);
  
  let score = 0;
  
  queryWords.forEach(queryWord => {
    // Exact title match gets highest score
    if (item.title.toLowerCase().includes(queryWord)) {
      score += 3;
    }
    
    // Title word match
    const titleMatches = titleWords.filter(word => word.includes(queryWord)).length;
    score += titleMatches * 2;
    
    // Content word match
    const contentMatches = contentWords.filter(word => word.includes(queryWord)).length;
    score += contentMatches * 1;
    
    // Tag match
    const tagMatches = tagWords.filter(word => word.includes(queryWord)).length;
    score += tagMatches * 1.5;
  });
  
  // Boost for exact phrase matches
  if (item.title.toLowerCase() === query.toLowerCase()) {
    score += 5;
  }
  
  return score;
}

function calculateRecencyBoost(timestamp: Date): number {
  const now = new Date();
  const ageInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
  
  if (ageInHours < 1) return 1.5; // Very recent
  if (ageInHours < 24) return 1.2; // Today
  if (ageInHours < 168) return 0.8; // This week
  if (ageInHours < 720) return 0.5; // This month
  return 0.2; // Older
}

function calculateRatingBoost(rating?: number): number {
  if (!rating) return 0;
  
  if (rating >= 4.5) return 1.0;
  if (rating >= 4.0) return 0.8;
  if (rating >= 3.5) return 0.6;
  if (rating >= 3.0) return 0.4;
  return 0.2;
}

function calculatePopularityBoost(metadata: Record<string, any>): number {
  let boost = 0;
  
  // Volume boost for energy trades
  if (metadata.volume) {
    const volume = Number(metadata.volume);
    if (volume > 1000) boost += 0.5;
    else if (volume > 500) boost += 0.3;
    else if (volume > 100) boost += 0.1;
  }
  
  // Votes boost for DAO proposals
  if (metadata.votes) {
    const votes = Number(metadata.votes);
    if (votes > 100) boost += 0.5;
    else if (votes > 50) boost += 0.3;
    else if (votes > 10) boost += 0.1;
  }
  
  // Transaction count boost
  if (metadata.transactionCount) {
    const count = Number(metadata.transactionCount);
    if (count > 50) boost += 0.5;
    else if (count > 20) boost += 0.3;
    else if (count > 5) boost += 0.1;
  }
  
  return boost;
}

function calculateTypeScore(type: string, query: SearchQuery): number {
  // Default type preferences
  const typeScores: Record<string, number> = {
    'energy_trade': 1.0,
    'dao_proposal': 0.9,
    'market_data': 0.8,
    'transaction': 0.7,
    'user': 0.6
  };
  
  // Boost specific types based on query context
  if (query.text) {
    const queryLower = query.text.toLowerCase();
    
    if (queryLower.includes('trade') || queryLower.includes('buy') || queryLower.includes('sell')) {
      if (type === 'energy_trade') return typeScores[type] + 0.5;
    }
    
    if (queryLower.includes('proposal') || queryLower.includes('vote') || queryLower.includes('dao')) {
      if (type === 'dao_proposal') return typeScores[type] + 0.5;
    }
    
    if (queryLower.includes('price') || queryLower.includes('market')) {
      if (type === 'market_data') return typeScores[type] + 0.5;
    }
  }
  
  return typeScores[type] || 0.5;
}

function calculateFilterMatchBoost(item: SearchableItem, filters: any[]): number {
  if (!filters.length) return 0;
  
  let matches = 0;
  filters.forEach(filter => {
    const value = item.metadata[filter.field];
    
    switch (filter.operator) {
      case 'equals':
        if (value === filter.value) matches++;
        break;
      case 'contains':
        if (typeof value === 'string' && value.toLowerCase().includes(filter.value.toLowerCase())) {
          matches++;
        }
        break;
      case 'greater_than':
        if (Number(value) > Number(filter.value)) matches++;
        break;
      case 'less_than':
        if (Number(value) < Number(filter.value)) matches++;
        break;
      case 'in':
        if (Array.isArray(filter.value) && filter.value.includes(value)) matches++;
        break;
      case 'range':
        if (Array.isArray(filter.value) && 
            Number(value) >= filter.value[0] && 
            Number(value) <= filter.value[1]) {
          matches++;
        }
        break;
    }
  });
  
  return matches * 0.2; // Small boost for each filter match
}

function calculateTagRelevance(tags: string[], query: string): number {
  if (!query || !tags.length) return 0;
  
  const queryWords = query.toLowerCase().split(/\s+/);
  let relevance = 0;
  
  queryWords.forEach(queryWord => {
    tags.forEach(tag => {
      if (tag.toLowerCase().includes(queryWord)) {
        relevance += 0.5;
      }
    });
  });
  
  return Math.min(relevance, 2); // Cap tag relevance
}

export function calculateSearchQuality(results: SearchableItem[], query: SearchQuery): number {
  if (!results.length) return 0;
  
  const avgRelevance = results.reduce((sum, item) => sum + item.relevanceScore, 0) / results.length;
  const diversityScore = calculateDiversityScore(results);
  const freshnessScore = calculateFreshnessScore(results);
  
  return (avgRelevance * 0.5) + (diversityScore * 0.3) + (freshnessScore * 0.2);
}

function calculateDiversityScore(results: SearchableItem[]): number {
  const types = new Set(results.map(item => item.type));
  const locations = new Set(results.map(item => item.metadata.location).filter(Boolean));
  const energyTypes = new Set(results.map(item => item.metadata.energyType).filter(Boolean));
  
  return (types.size * 0.4) + (locations.size * 0.3) + (energyTypes.size * 0.3);
}

function calculateFreshnessScore(results: SearchableItem[]): number {
  const now = new Date();
  const avgAge = results.reduce((sum, item) => {
    const age = (now.getTime() - item.timestamp.getTime()) / (1000 * 60 * 60);
    return sum + age;
  }, 0) / results.length;
  
  // Convert to freshness score (newer = higher score)
  if (avgAge < 24) return 1.0;
  if (avgAge < 168) return 0.8;
  if (avgAge < 720) return 0.6;
  return 0.4;
}
