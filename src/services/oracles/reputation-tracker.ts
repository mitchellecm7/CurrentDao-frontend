export interface ProviderStats {
  id: string;
  name: string;
  uptime: number;
  accuracy: number;
  latency: number;
  totalRequests: number;
  failedRequests: number;
}

class ReputationTracker {
  private stats: Map<string, ProviderStats> = new Map();

  updateStats(providerId: string, success: boolean, latency: number, isOutlier: boolean) {
    const current = this.stats.get(providerId) || {
      id: providerId,
      name: providerId,
      uptime: 100,
      accuracy: 100,
      latency: 0,
      totalRequests: 0,
      failedRequests: 0,
    };

    current.totalRequests++;
    if (!success) current.failedRequests++;
    
    // Weighted moving average for latency
    current.latency = current.latency * 0.9 + latency * 0.1;
    
    // Update accuracy (1 - outlier_rate)
    if (isOutlier) {
      current.accuracy = Math.max(0, current.accuracy - 1);
    } else {
      current.accuracy = Math.min(100, current.accuracy + 0.1);
    }

    current.uptime = ((current.totalRequests - current.failedRequests) / current.totalRequests) * 100;

    this.stats.set(providerId, current);
  }

  getStats(providerId: string): ProviderStats | undefined {
    return this.stats.get(providerId);
  }

  getAllStats(): ProviderStats[] {
    return Array.from(this.stats.values());
  }
}

export const reputationTracker = new ReputationTracker();
