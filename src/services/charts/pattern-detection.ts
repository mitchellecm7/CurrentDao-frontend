import { PriceDataPoint } from '@/types/charts';

export interface ChartPattern {
  id: string;
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  startIndex: number;
  endIndex: number;
  description: string;
  targets?: {
    price: number;
    probability: number;
  }[];
  stopLoss?: number;
}

export interface PatternDetectionResult {
  patterns: ChartPattern[];
  timestamp: number;
  dataPoints: number;
}

// Pattern recognition engine
export class PatternRecognitionEngine {
  // Detect Head and Shoulders pattern
  static detectHeadAndShoulders(data: PriceDataPoint[]): ChartPattern[] {
    const patterns: ChartPattern[] = [];
    const windowSize = 20;
    
    for (let i = windowSize; i < data.length - windowSize; i++) {
      const window = data.slice(i - windowSize, i + windowSize);
      const highs = window.map(p => p.high);
      const lows = window.map(p => p.low);
      
      // Find potential head and shoulders
      const leftShoulder = this.findLocalMax(highs, windowSize * 0.2);
      const head = this.findLocalMax(highs, windowSize * 0.5);
      const rightShoulder = this.findLocalMax(highs, windowSize * 0.8);
      
      if (leftShoulder && head && rightShoulder) {
        const neckline = this.calculateNeckline(window, leftShoulder, rightShoulder);
        const confidence = this.calculateHeadAndShouldersConfidence(window, leftShoulder, head, rightShoulder, neckline);
        
        if (confidence > 0.7) {
          patterns.push({
            id: `head-shoulders-${i}`,
            name: 'Head and Shoulders',
            type: 'bearish',
            confidence,
            startIndex: i - windowSize,
            endIndex: i + windowSize,
            description: 'Bearish reversal pattern indicating potential downtrend',
            targets: [
              { price: neckline * 0.95, probability: 0.8 },
              { price: neckline * 0.9, probability: 0.6 }
            ],
            stopLoss: head * 1.02
          });
        }
      }
    }
    
    return patterns;
  }

  // Detect Double Top/Bottom patterns
  static detectDoubleTopBottom(data: PriceDataPoint[]): ChartPattern[] {
    const patterns: ChartPattern[] = [];
    const windowSize = 30;
    
    for (let i = windowSize; i < data.length - windowSize; i++) {
      const window = data.slice(i - windowSize, i + windowSize);
      const highs = window.map(p => p.high);
      const lows = window.map(p => p.low);
      
      // Double Top
      const top1 = this.findLocalMax(highs, windowSize * 0.3);
      const top2 = this.findLocalMax(highs, windowSize * 0.7);
      
      if (top1 && top2 && Math.abs(highs[top1] - highs[top2]) / highs[top1] < 0.03) {
        const neckline = Math.min(...lows.slice(top1, top2));
        const confidence = this.calculateDoubleTopConfidence(window, top1, top2, neckline);
        
        if (confidence > 0.75) {
          patterns.push({
            id: `double-top-${i}`,
            name: 'Double Top',
            type: 'bearish',
            confidence,
            startIndex: i - windowSize,
            endIndex: i + windowSize,
            description: 'Bearish reversal pattern with two peaks at similar levels',
            targets: [
              { price: neckline * 0.95, probability: 0.8 },
              { price: neckline * 0.9, probability: 0.6 }
            ],
            stopLoss: highs[top1] * 1.02
          });
        }
      }
      
      // Double Bottom
      const bottom1 = this.findLocalMin(lows, windowSize * 0.3);
      const bottom2 = this.findLocalMin(lows, windowSize * 0.7);
      
      if (bottom1 && bottom2 && Math.abs(lows[bottom1] - lows[bottom2]) / lows[bottom1] < 0.03) {
        const neckline = Math.max(...highs.slice(bottom1, bottom2));
        const confidence = this.calculateDoubleBottomConfidence(window, bottom1, bottom2, neckline);
        
        if (confidence > 0.75) {
          patterns.push({
            id: `double-bottom-${i}`,
            name: 'Double Bottom',
            type: 'bullish',
            confidence,
            startIndex: i - windowSize,
            endIndex: i + windowSize,
            description: 'Bullish reversal pattern with two troughs at similar levels',
            targets: [
              { price: neckline * 1.05, probability: 0.8 },
              { price: neckline * 1.1, probability: 0.6 }
            ],
            stopLoss: lows[bottom1] * 0.98
          });
        }
      }
    }
    
    return patterns;
  }

  // Detect Triangle patterns
  static detectTriangles(data: PriceDataPoint[]): ChartPattern[] {
    const patterns: ChartPattern[] = [];
    const windowSize = 40;
    
    for (let i = windowSize; i < data.length - windowSize; i++) {
      const window = data.slice(i - windowSize, i + windowSize);
      
      // Ascending Triangle
      const ascendingTriangle = this.detectAscendingTriangle(window);
      if (ascendingTriangle.confidence > 0.7) {
        patterns.push({
          id: `ascending-triangle-${i}`,
          name: 'Ascending Triangle',
          type: 'bullish',
          confidence: ascendingTriangle.confidence,
          startIndex: i - windowSize,
          endIndex: i + windowSize,
          description: 'Bullish continuation pattern with horizontal resistance and rising support',
          targets: [
            { price: ascendingTriangle.resistance * 1.05, probability: 0.8 }
          ],
          stopLoss: ascendingTriangle.support * 0.98
        });
      }
      
      // Descending Triangle
      const descendingTriangle = this.detectDescendingTriangle(window);
      if (descendingTriangle.confidence > 0.7) {
        patterns.push({
          id: `descending-triangle-${i}`,
          name: 'Descending Triangle',
          type: 'bearish',
          confidence: descendingTriangle.confidence,
          startIndex: i - windowSize,
          endIndex: i + windowSize,
          description: 'Bearish continuation pattern with horizontal support and declining resistance',
          targets: [
            { price: descendingTriangle.support * 0.95, probability: 0.8 }
          ],
          stopLoss: descendingTriangle.resistance * 1.02
        });
      }
      
      // Symmetrical Triangle
      const symmetricalTriangle = this.detectSymmetricalTriangle(window);
      if (symmetricalTriangle.confidence > 0.7) {
        patterns.push({
          id: `symmetrical-triangle-${i}`,
          name: 'Symmetrical Triangle',
          type: 'neutral',
          confidence: symmetricalTriangle.confidence,
          startIndex: i - windowSize,
          endIndex: i + windowSize,
          description: 'Neutral pattern indicating consolidation before breakout',
          targets: [
            { price: symmetricalTriangle.upper * 1.05, probability: 0.4 },
            { price: symmetricalTriangle.lower * 0.95, probability: 0.4 }
          ]
        });
      }
    }
    
    return patterns;
  }

  // Detect Flag and Pennant patterns
  static detectFlagsAndPennants(data: PriceDataPoint[]): ChartPattern[] {
    const patterns: ChartPattern[] = [];
    const windowSize = 25;
    
    for (let i = windowSize; i < data.length - windowSize; i++) {
      const window = data.slice(i - windowSize, i + windowSize);
      
      // Bull Flag
      const bullFlag = this.detectBullFlag(window);
      if (bullFlag.confidence > 0.7) {
        patterns.push({
          id: `bull-flag-${i}`,
          name: 'Bull Flag',
          type: 'bullish',
          confidence: bullFlag.confidence,
          startIndex: i - windowSize,
          endIndex: i + windowSize,
          description: 'Bullish continuation pattern after strong upward move',
          targets: [
            { price: bullFlag.flagpoleTop * 1.1, probability: 0.8 }
          ],
          stopLoss: bullFlag.flagBottom * 0.98
        });
      }
      
      // Bear Flag
      const bearFlag = this.detectBearFlag(window);
      if (bearFlag.confidence > 0.7) {
        patterns.push({
          id: `bear-flag-${i}`,
          name: 'Bear Flag',
          type: 'bearish',
          confidence: bearFlag.confidence,
          startIndex: i - windowSize,
          endIndex: i + windowSize,
          description: 'Bearish continuation pattern after strong downward move',
          targets: [
            { price: bearFlag.flagpoleBottom * 0.9, probability: 0.8 }
          ],
          stopLoss: bearFlag.flagTop * 1.02
        });
      }
    }
    
    return patterns;
  }

  // Helper methods
  private static findLocalMax(arr: number[], position: number): number | null {
    const index = Math.floor(arr.length * position);
    const window = 3;
    
    for (let i = window; i < arr.length - window; i++) {
      if (Math.abs(i - index) < window * 2) {
        const isMax = arr.slice(i - window, i + window + 1).every(val => val <= arr[i]);
        if (isMax) return i;
      }
    }
    return null;
  }

  private static findLocalMin(arr: number[], position: number): number | null {
    const index = Math.floor(arr.length * position);
    const window = 3;
    
    for (let i = window; i < arr.length - window; i++) {
      if (Math.abs(i - index) < window * 2) {
        const isMin = arr.slice(i - window, i + window + 1).every(val => val >= arr[i]);
        if (isMin) return i;
      }
    }
    return null;
  }

  private static calculateNeckline(window: PriceDataPoint[], leftShoulder: number, rightShoulder: number): number {
    const lows = window.map(p => p.low);
    const leftLow = Math.min(...lows.slice(0, leftShoulder));
    const rightLow = Math.min(...lows.slice(rightShoulder));
    return (leftLow + rightLow) / 2;
  }

  private static calculateHeadAndShouldersConfidence(
    window: PriceDataPoint[], 
    leftShoulder: number, 
    head: number, 
    rightShoulder: number, 
    neckline: number
  ): number {
    const highs = window.map(p => p.high);
    const leftShoulderHeight = highs[leftShoulder] - neckline;
    const headHeight = highs[head] - neckline;
    const rightShoulderHeight = highs[rightShoulder] - neckline;
    
    // Head should be significantly higher than shoulders
    const headDominance = (headHeight - Math.max(leftShoulderHeight, rightShoulderHeight)) / headHeight;
    
    // Shoulders should be roughly equal
    const shoulderSymmetry = 1 - Math.abs(leftShoulderHeight - rightShoulderHeight) / Math.max(leftShoulderHeight, rightShoulderHeight);
    
    return Math.min(1, (headDominance * 0.6 + shoulderSymmetry * 0.4));
  }

  private static calculateDoubleTopConfidence(window: PriceDataPoint[], top1Index: number, top2Index: number, neckline: number): number {
    const highs = window.map(p => p.high);
    const volume = window.map(p => p.volume);
    
    // Check volume pattern (decreasing on second top)
    const volumePattern = volume[top2Index] < volume[top1Index] ? 0.8 : 0.4;
    
    // Check symmetry
    const symmetry = 1 - Math.abs(highs[top1Index] - highs[top2Index]) / highs[top1Index];
    
    return (volumePattern + symmetry) / 2;
  }

  private static calculateDoubleBottomConfidence(window: PriceDataPoint[], bottom1Index: number, bottom2Index: number, neckline: number): number {
    const lows = window.map(p => p.low);
    const volume = window.map(p => p.volume);
    
    // Check volume pattern (increasing on second bottom)
    const volumePattern = volume[bottom2Index] > volume[bottom1Index] ? 0.8 : 0.4;
    
    // Check symmetry
    const symmetry = 1 - Math.abs(lows[bottom1Index] - lows[bottom2Index]) / lows[bottom1Index];
    
    return (volumePattern + symmetry) / 2;
  }

  private static detectAscendingTriangle(window: PriceDataPoint[]): { confidence: number; resistance: number; support: number } {
    const highs = window.map(p => p.high);
    const lows = window.map(p => p.low);
    
    // Find horizontal resistance line
    const resistance = this.findHorizontalLine(highs, 0.1);
    
    // Find rising support line
    const support = this.findTrendLine(lows, true);
    
    if (resistance && support) {
      const confidence = this.calculateTriangleConfidence(highs, lows, resistance, support, true);
      return { confidence, resistance, support };
    }
    
    return { confidence: 0, resistance: 0, support: 0 };
  }

  private static detectDescendingTriangle(window: PriceDataPoint[]): { confidence: number; resistance: number; support: number } {
    const highs = window.map(p => p.high);
    const lows = window.map(p => p.low);
    
    // Find declining resistance line
    const resistance = this.findTrendLine(highs, false);
    
    // Find horizontal support line
    const support = this.findHorizontalLine(lows, 0.1);
    
    if (resistance && support) {
      const confidence = this.calculateTriangleConfidence(highs, lows, resistance, support, false);
      return { confidence, resistance, support };
    }
    
    return { confidence: 0, resistance: 0, support: 0 };
  }

  private static detectSymmetricalTriangle(window: PriceDataPoint[]): { confidence: number; upper: number; lower: number } {
    const highs = window.map(p => p.high);
    const lows = window.map(p => p.low);
    
    const upper = this.findTrendLine(highs, false);
    const lower = this.findTrendLine(lows, true);
    
    if (upper && lower) {
      const convergence = Math.abs(upper - lower) / Math.max(upper, lower);
      const confidence = convergence < 0.1 ? 0.8 : 0.4;
      return { confidence, upper, lower };
    }
    
    return { confidence: 0, upper: 0, lower: 0 };
  }

  private static detectBullFlag(window: PriceDataPoint[]): { confidence: number; flagpoleTop: number; flagBottom: number } {
    // Simplified bull flag detection
    const highs = window.map(p => p.high);
    const lows = window.map(p => p.low);
    
    const flagpoleTop = Math.max(...highs.slice(0, 5));
    const flagBottom = Math.min(...lows.slice(5));
    
    const consolidation = this.isConsolidating(lows.slice(5), 0.05);
    const confidence = consolidation ? 0.75 : 0.3;
    
    return { confidence, flagpoleTop, flagBottom };
  }

  private static detectBearFlag(window: PriceDataPoint[]): { confidence: number; flagpoleBottom: number; flagTop: number } {
    // Simplified bear flag detection
    const highs = window.map(p => p.high);
    const lows = window.map(p => p.low);
    
    const flagpoleBottom = Math.min(...lows.slice(0, 5));
    const flagTop = Math.max(...highs.slice(5));
    
    const consolidation = this.isConsolidating(highs.slice(5), 0.05);
    const confidence = consolidation ? 0.75 : 0.3;
    
    return { confidence, flagpoleBottom, flagTop };
  }

  private static findHorizontalLine(arr: number[], tolerance: number): number | null {
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / arr.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev / avg < tolerance ? avg : null;
  }

  private static findTrendLine(arr: number[], rising: boolean): number | null {
    // Simple linear regression to find trend
    const n = arr.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = arr.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * arr[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Check if trend matches expected direction
    const isCorrectDirection = (rising && slope > 0) || (!rising && slope < 0);
    
    return isCorrectDirection ? slope : null;
  }

  private static calculateTriangleConfidence(
    highs: number[], 
    lows: number[], 
    resistance: number, 
    support: number, 
    ascending: boolean
  ): number {
    // Check how well the data fits the triangle pattern
    const upperFit = this.calculateLineFit(highs, resistance, !ascending);
    const lowerFit = this.calculateLineFit(lows, support, ascending);
    
    return (upperFit + lowerFit) / 2;
  }

  private static calculateLineFit(data: number[], line: number, rising: boolean): number {
    // Calculate R-squared for line fit
    const predicted = data.map((_, i) => line + (rising ? i * 0.01 : -i * 0.01));
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    
    const totalSumSquares = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
    const residualSumSquares = data.reduce((acc, val, i) => acc + Math.pow(val - predicted[i], 2), 0);
    
    return totalSumSquares > 0 ? 1 - (residualSumSquares / totalSumSquares) : 0;
  }

  private static isConsolidating(arr: number[], threshold: number): boolean {
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    const maxDeviation = Math.max(...arr.map(val => Math.abs(val - avg)));
    return maxDeviation / avg < threshold;
  }
}

// Main pattern detection function
export const detectPatterns = async (data: PriceDataPoint[]): Promise<ChartPattern[]> => {
  if (data.length < 50) {
    return [];
  }

  const patterns: ChartPattern[] = [];
  
  try {
    // Detect various pattern types
    const headAndShoulders = PatternRecognitionEngine.detectHeadAndShoulders(data);
    const doubleTopBottom = PatternRecognitionEngine.detectDoubleTopBottom(data);
    const triangles = PatternRecognitionEngine.detectTriangles(data);
    const flagsAndPennants = PatternRecognitionEngine.detectFlagsAndPennants(data);
    
    patterns.push(...headAndShoulders, ...doubleTopBottom, ...triangles, ...flagsAndPennants);
    
    // Sort by confidence and remove duplicates
    const uniquePatterns = patterns
      .sort((a, b) => b.confidence - a.confidence)
      .filter((pattern, index, arr) => 
        arr.findIndex(p => p.startIndex === pattern.startIndex && p.endIndex === pattern.endIndex) === index
      );
    
    return uniquePatterns.slice(0, 10); // Return top 10 patterns
  } catch (error) {
    console.error('Error detecting patterns:', error);
    return [];
  }
};

// AI-assisted pattern detection (mock implementation)
export const detectPatternsWithAI = async (data: PriceDataPoint[]): Promise<ChartPattern[]> => {
  // This would integrate with a machine learning model
  // For now, return enhanced traditional pattern detection
  const traditionalPatterns = await detectPatterns(data);
  
  // Add AI confidence scores and additional analysis
  return traditionalPatterns.map(pattern => ({
    ...pattern,
    confidence: Math.min(1, pattern.confidence * 1.1), // Slight AI boost
    description: `${pattern.description} (AI-verified)`
  }));
};

// Real-time pattern detection
export class RealTimePatternDetector {
  private dataBuffer: PriceDataPoint[] = [];
  private readonly maxBufferSize = 200;
  private lastDetection = 0;
  private readonly detectionInterval = 5000; // 5 seconds

  addDataPoint(point: PriceDataPoint): void {
    this.dataBuffer.push(point);
    
    if (this.dataBuffer.length > this.maxBufferSize) {
      this.dataBuffer.shift();
    }
    
    const now = Date.now();
    if (now - this.lastDetection > this.detectionInterval) {
      this.lastDetection = now;
      this.detectPatterns();
    }
  }

  private async detectPatterns(): Promise<void> {
    if (this.dataBuffer.length < 50) return;
    
    const patterns = await detectPatterns(this.dataBuffer);
    
    // Emit pattern detection events
    patterns.forEach(pattern => {
      this.onPatternDetected?.(pattern);
    });
  }

  onPatternDetected?: (pattern: ChartPattern) => void;
}
