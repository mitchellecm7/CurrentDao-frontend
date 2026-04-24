import { Trade, Portfolio, PortfolioAsset, PerformanceMetrics, ProfitLossData, AssetAllocation, TradingStatistics, TaxReport, BenchmarkComparison } from '../types/portfolio';

export class PortfolioCalculator {
  static calculateReturns(trades: Trade[], currentPrices: Record<string, number>): PerformanceMetrics {
    const completedTrades = trades.filter(t => t.status === 'completed');
    const totalTrades = completedTrades.length;
    
    let totalReturn = 0;
    let totalInvested = 0;
    let wins = 0;
    let losses = 0;
    let winAmounts: number[] = [];
    let lossAmounts: number[] = [];
    
    const assetTrades: Record<string, Trade[]> = {};
    
    completedTrades.forEach(trade => {
      if (!assetTrades[trade.asset]) {
        assetTrades[trade.asset] = [];
      }
      assetTrades[trade.asset].push(trade);
      
      if (trade.type === 'buy') {
        totalInvested += trade.totalValue + trade.fees;
      } else {
        const buyTrades = assetTrades[trade.asset].filter(t => t.type === 'buy');
        const avgBuyPrice = buyTrades.reduce((sum, t) => sum + t.price * t.quantity, 0) / 
                           buyTrades.reduce((sum, t) => sum + t.quantity, 0);
        const profit = (trade.price - avgBuyPrice) * trade.quantity - trade.fees;
        totalReturn += profit;
        
        if (profit > 0) {
          wins++;
          winAmounts.push(profit);
        } else {
          losses++;
          lossAmounts.push(Math.abs(profit));
        }
      }
    });
    
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const averageWin = winAmounts.length > 0 ? winAmounts.reduce((a, b) => a + b, 0) / winAmounts.length : 0;
    const averageLoss = lossAmounts.length > 0 ? lossAmounts.reduce((a, b) => a + b, 0) / lossAmounts.length : 0;
    const largestWin = winAmounts.length > 0 ? Math.max(...winAmounts) : 0;
    const largestLoss = lossAmounts.length > 0 ? Math.max(...lossAmounts) : 0;
    
    const profitFactor = averageLoss > 0 ? (averageWin * wins) / (averageLoss * losses) : 0;
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    
    const dailyReturns = this.calculateDailyReturns(trades, currentPrices);
    const volatility = this.calculateVolatility(dailyReturns);
    const sharpeRatio = this.calculateSharpeRatio(dailyReturns);
    const maxDrawdown = this.calculateMaxDrawdown(dailyReturns);
    
    return {
      totalReturn,
      totalReturnPercentage: returnPercentage,
      annualizedReturn: this.calculateAnnualizedReturn(returnPercentage, trades),
      sharpeRatio,
      volatility,
      maxDrawdown,
      beta: 1.0,
      alpha: 0,
      winRate,
      profitFactor,
      averageWin,
      averageLoss,
      largestWin,
      largestLoss,
      totalTrades,
      winningTrades: wins,
      losingTrades: losses
    };
  }
  
  static calculateProfitLoss(trades: Trade[], currentPrices: Record<string, number>): ProfitLossData {
    const assetHoldings: Record<string, number> = {};
    const assetCostBasis: Record<string, number> = {};
    
    trades.filter(t => t.status === 'completed').forEach(trade => {
      if (trade.type === 'buy') {
        assetHoldings[trade.asset] = (assetHoldings[trade.asset] || 0) + trade.quantity;
        assetCostBasis[trade.asset] = (assetCostBasis[trade.asset] || 0) + trade.totalValue;
      } else {
        assetHoldings[trade.asset] = (assetHoldings[trade.asset] || 0) - trade.quantity;
      }
    });
    
    let unrealizedPnL = 0;
    const pnlByAsset: Record<string, number> = {};
    const pnlByAssetType: Record<string, number> = {};
    
    Object.keys(assetHoldings).forEach(asset => {
      if (assetHoldings[asset] > 0) {
        const currentValue = assetHoldings[asset] * (currentPrices[asset] || 0);
        const costBasis = assetCostBasis[asset] || 0;
        const pnl = currentValue - costBasis;
        unrealizedPnL += pnl;
        pnlByAsset[asset] = pnl;
      }
    });
    
    const realizedPnL = this.calculateRealizedPnL(trades);
    
    return {
      realizedPnL,
      unrealizedPnL,
      totalPnL: realizedPnL + unrealizedPnL,
      dailyPnL: this.calculateDailyPnL(trades, currentPrices),
      monthlyPnL: this.calculateMonthlyPnL(trades, currentPrices),
      yearlyPnL: this.calculateYearlyPnL(trades, currentPrices),
      pnlByAsset,
      pnlByAssetType
    };
  }
  
  static calculateAssetAllocation(assets: PortfolioAsset[]): AssetAllocation[] {
    const totalValue = assets.reduce((sum, asset) => sum + asset.totalValue, 0);
    const allocationByType: Record<string, { value: number; assets: PortfolioAsset[] }> = {};
    
    assets.forEach(asset => {
      if (!allocationByType[asset.type]) {
        allocationByType[asset.type] = { value: 0, assets: [] };
      }
      allocationByType[asset.type].value += asset.totalValue;
      allocationByType[asset.type].assets.push(asset);
    });
    
    return Object.keys(allocationByType).map(type => ({
      assetType: type,
      value: allocationByType[type].value,
      percentage: totalValue > 0 ? (allocationByType[type].value / totalValue) * 100 : 0,
      targetPercentage: this.getTargetAllocation(type),
      deviation: 0,
      assets: allocationByType[type].assets
    }));
  }
  
  static calculateTradingStatistics(trades: Trade[]): TradingStatistics {
    const completedTrades = trades.filter(t => t.status === 'completed');
    const buyTrades = completedTrades.filter(t => t.type === 'buy');
    const sellTrades = completedTrades.filter(t => t.type === 'sell');
    
    const totalVolume = completedTrades.reduce((sum, trade) => sum + trade.totalValue, 0);
    const totalFees = completedTrades.reduce((sum, trade) => sum + trade.fees, 0);
    const averageTradeSize = completedTrades.length > 0 ? totalVolume / completedTrades.length : 0;
    
    const assetFrequency: Record<string, number> = {};
    completedTrades.forEach(trade => {
      assetFrequency[trade.asset] = (assetFrequency[trade.asset] || 0) + 1;
    });
    
    const mostTradedAsset = Object.keys(assetFrequency).reduce((a, b) => 
      assetFrequency[a] > assetFrequency[b] ? a : b, '');
    
    const firstTrade = completedTrades[0];
    const lastTrade = completedTrades[completedTrades.length - 1];
    const daysDiff = lastTrade && firstTrade ? 
      Math.ceil((lastTrade.timestamp.getTime() - firstTrade.timestamp.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const tradeFrequency = daysDiff > 0 ? completedTrades.length / daysDiff : 0;
    
    return {
      totalTrades: completedTrades.length,
      buyTrades: buyTrades.length,
      sellTrades: sellTrades.length,
      averageTradeSize,
      averageHoldingPeriod: this.calculateAverageHoldingPeriod(completedTrades),
      tradeFrequency,
      mostTradedAsset,
      bestPerformingAsset: '',
      worstPerformingAsset: '',
      tradingVolume: totalVolume,
      feesPaid: totalFees,
      taxLiability: this.calculateTaxLiability(completedTrades)
    };
  }
  
  static generateTaxReports(trades: Trade[], year: number): TaxReport {
    const yearTrades = trades.filter(t => 
      t.status === 'completed' && 
      t.timestamp.getFullYear() === year
    );
    
    let shortTermGains = 0;
    let longTermGains = 0;
    let losses = 0;
    
    const assetGroups: Record<string, Trade[]> = {};
    yearTrades.forEach(trade => {
      if (!assetGroups[trade.asset]) {
        assetGroups[trade.asset] = [];
      }
      assetGroups[trade.asset].push(trade);
    });
    
    Object.keys(assetGroups).forEach(asset => {
      const buys = assetGroups[asset].filter(t => t.type === 'buy').sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const sells = assetGroups[asset].filter(t => t.type === 'sell').sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      sells.forEach(sell => {
        let remainingQuantity = sell.quantity;
        let buyIndex = 0;
        
        while (remainingQuantity > 0 && buyIndex < buys.length) {
          const buy = buys[buyIndex];
          const tradeQuantity = Math.min(remainingQuantity, buy.quantity);
          const profit = (sell.price - buy.price) * tradeQuantity - sell.fees;
          
          const holdingPeriod = Math.ceil((sell.timestamp.getTime() - buy.timestamp.getTime()) / (1000 * 60 * 60 * 24));
          
          if (profit > 0) {
            if (holdingPeriod > 365) {
              longTermGains += profit;
            } else {
              shortTermGains += profit;
            }
          } else {
            losses += Math.abs(profit);
          }
          
          remainingQuantity -= tradeQuantity;
          buyIndex++;
        }
      });
    });
    
    const totalGains = shortTermGains + longTermGains;
    const netGains = totalGains - losses;
    const taxRate = this.getTaxRate(shortTermGains, longTermGains);
    const estimatedTax = netGains * taxRate;
    
    return {
      year,
      shortTermGains,
      longTermGains,
      totalGains,
      losses,
      netGains,
      taxRate,
      estimatedTax,
      trades: yearTrades
    };
  }
  
  static compareWithBenchmark(portfolioReturn: number, benchmarkReturn: number, portfolioVolatility: number, benchmarkVolatility: number): BenchmarkComparison {
    const excessReturn = portfolioReturn - benchmarkReturn;
    const correlation = 0.7;
    const trackingError = Math.sqrt(portfolioVolatility * portfolioVolatility + benchmarkVolatility * benchmarkVolatility - 2 * correlation * portfolioVolatility * benchmarkVolatility);
    const informationRatio = trackingError > 0 ? excessReturn / trackingError : 0;
    
    return {
      benchmark: 'S&P 500',
      portfolioReturn,
      benchmarkReturn,
      excessReturn,
      correlation,
      trackingError,
      informationRatio
    };
  }
  
  private static calculateDailyReturns(trades: Trade[], currentPrices: Record<string, number>): number[] {
    const dailyReturns: number[] = [];
    const portfolioValue: Record<string, number> = {};
    
    trades.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).forEach(trade => {
      if (trade.type === 'buy') {
        portfolioValue[trade.asset] = (portfolioValue[trade.asset] || 0) + trade.quantity;
      } else {
        portfolioValue[trade.asset] = (portfolioValue[trade.asset] || 0) - trade.quantity;
      }
    });
    
    return dailyReturns;
  }
  
  private static calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    return Math.sqrt(variance) * Math.sqrt(252);
  }
  
  private static calculateSharpeRatio(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = this.calculateVolatility(returns);
    const riskFreeRate = 0.02;
    
    return volatility > 0 ? (mean - riskFreeRate) / volatility : 0;
  }
  
  private static calculateMaxDrawdown(returns: number[]): number {
    let maxDrawdown = 0;
    let peak = 0;
    let cumulative = 0;
    
    returns.forEach(r => {
      cumulative += r;
      if (cumulative > peak) {
        peak = cumulative;
      }
      const drawdown = (peak - cumulative) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });
    
    return maxDrawdown * 100;
  }
  
  private static calculateAnnualizedReturn(totalReturn: number, trades: Trade[]): number {
    if (trades.length < 2) return 0;
    
    const firstTrade = trades[0];
    const lastTrade = trades[trades.length - 1];
    const years = (lastTrade.timestamp.getTime() - firstTrade.timestamp.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    return years > 0 ? Math.pow(1 + totalReturn / 100, 1 / years) - 1 : 0;
  }
  
  private static calculateRealizedPnL(trades: Trade[]): number {
    let realizedPnL = 0;
    const assetPositions: Record<string, { quantity: number; costBasis: number }> = {};
    
    trades.filter(t => t.status === 'completed').forEach(trade => {
      if (trade.type === 'buy') {
        assetPositions[trade.asset] = {
          quantity: (assetPositions[trade.asset]?.quantity || 0) + trade.quantity,
          costBasis: (assetPositions[trade.asset]?.costBasis || 0) + trade.totalValue
        };
      } else {
        const position = assetPositions[trade.asset];
        if (position && position.quantity > 0) {
          const avgCost = position.costBasis / position.quantity;
          const profit = (trade.price - avgCost) * trade.quantity - trade.fees;
          realizedPnL += profit;
          
          position.quantity -= trade.quantity;
          position.costBasis -= avgCost * trade.quantity;
        }
      }
    });
    
    return realizedPnL;
  }
  
  private static calculateDailyPnL(trades: Trade[], currentPrices: Record<string, number>): number[] {
    return [];
  }
  
  private static calculateMonthlyPnL(trades: Trade[], currentPrices: Record<string, number>): number[] {
    return [];
  }
  
  private static calculateYearlyPnL(trades: Trade[], currentPrices: Record<string, number>): number[] {
    return [];
  }
  
  private static getTargetAllocation(assetType: string): number {
    const targets: Record<string, number> = {
      solar: 30,
      wind: 25,
      hydro: 15,
      nuclear: 10,
      fossil: 10,
      battery: 5,
      grid: 5
    };
    return targets[assetType] || 0;
  }
  
  private static calculateAverageHoldingPeriod(trades: Trade[]): number {
    const assetGroups: Record<string, Trade[]> = {};
    trades.forEach(trade => {
      if (!assetGroups[trade.asset]) {
        assetGroups[trade.asset] = [];
      }
      assetGroups[trade.asset].push(trade);
    });
    
    let totalHoldingPeriod = 0;
    let tradeCount = 0;
    
    Object.keys(assetGroups).forEach(asset => {
      const buys = assetGroups[asset].filter(t => t.type === 'buy').sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const sells = assetGroups[asset].filter(t => t.type === 'sell').sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      sells.forEach(sell => {
        let remainingQuantity = sell.quantity;
        let buyIndex = 0;
        
        while (remainingQuantity > 0 && buyIndex < buys.length) {
          const buy = buys[buyIndex];
          const tradeQuantity = Math.min(remainingQuantity, buy.quantity);
          const holdingPeriod = (sell.timestamp.getTime() - buy.timestamp.getTime()) / (1000 * 60 * 60 * 24);
          
          totalHoldingPeriod += holdingPeriod * tradeQuantity;
          tradeCount += tradeQuantity;
          
          remainingQuantity -= tradeQuantity;
          buyIndex++;
        }
      });
    });
    
    return tradeCount > 0 ? totalHoldingPeriod / tradeCount : 0;
  }
  
  private static calculateTaxLiability(trades: Trade[]): number {
    return 0;
  }
  
  private static getTaxRate(shortTermGains: number, longTermGains: number): number {
    return 0.25;
  }
}
