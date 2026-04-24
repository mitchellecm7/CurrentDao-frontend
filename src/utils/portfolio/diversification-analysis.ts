import { Portfolio, AssetAllocation, PortfolioAsset } from '../../types/portfolio';

export class DiversificationAnalysis {
  public static analyze(portfolio: Portfolio): AssetAllocation[] {
    const types = Array.from(new Set(portfolio.assets.map(a => a.type)));
    
    return types.map(type => {
      const typeAssets = portfolio.assets.filter(a => a.type === type);
      const totalTypeValue = typeAssets.reduce((sum, a) => sum + a.totalValue, 0);
      const percentage = (totalTypeValue / portfolio.totalValue) * 100 || 0;
      
      // Mock targets
      const targets: Record<string, number> = {
        solar: 30,
        wind: 25,
        hydro: 15,
        nuclear: 20,
        fossil: 5,
        battery: 5
      };

      const targetPercentage = targets[type] || (100 / types.length);

      return {
        assetType: type,
        value: totalTypeValue,
        percentage,
        targetPercentage,
        deviation: percentage - targetPercentage,
        assets: typeAssets
      };
    });
  }

  public static getRebalancingSuggestions(allocation: AssetAllocation[]): { assetType: string; action: 'buy' | 'sell'; amount: number }[] {
    return allocation
      .filter(a => Math.abs(a.deviation) > 2) // 2% threshold
      .map(a => ({
        assetType: a.assetType,
        action: a.deviation > 0 ? 'sell' : 'buy',
        amount: Math.abs(a.value * (a.deviation / 100))
      }));
  }
}
