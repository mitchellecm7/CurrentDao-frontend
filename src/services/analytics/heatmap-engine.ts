import { HeatmapPoint, HeatmapData } from '@/types/analytics';

interface HeatmapConfig {
  gridSize: number;
  intensityThreshold: number;
  smoothingRadius: number;
  colorScheme: 'hot' | 'cool' | 'viridis' | 'plasma';
  maxDataPoints: number;
  compressionLevel: number;
  enableRealTime: boolean;
  samplingRate: number;
}

interface HeatmapFilter {
  type: 'all' | 'click' | 'scroll' | 'hover' | 'movement';
  dateRange: {
    start: Date;
    end: Date;
  };
  intensityRange: {
    min: number;
    max: number;
  };
  viewportFilter: {
    width?: number;
    height?: number;
  };
}

interface ProcessedHeatmapData {
  grid: number[][];
  metadata: {
    totalPoints: number;
    averageIntensity: number;
    maxIntensity: number;
    coverage: number;
    hotspots: Array<{
      x: number;
      y: number;
      intensity: number;
      radius: number;
    }>;
  };
  performance: {
    processingTime: number;
    memoryUsage: number;
    dataLoss: number;
  };
}

class HeatmapEngine {
  private config: HeatmapConfig;
  private dataBuffer: HeatmapPoint[] = [];
  private processedData: ProcessedHeatmapData | null = null;
  private isProcessing = false;

  constructor(config: Partial<HeatmapConfig> = {}) {
    this.config = {
      gridSize: 20,
      intensityThreshold: 5,
      smoothingRadius: 30,
      colorScheme: 'hot',
      maxDataPoints: 100000,
      compressionLevel: 0.8,
      enableRealTime: true,
      samplingRate: 0.1,
      ...config,
    };
  }

  // Add data points to the buffer
  addDataPoint(point: HeatmapPoint): void {
    if (this.dataBuffer.length >= this.config.maxDataPoints) {
      // Remove oldest points when buffer is full
      const removeCount = Math.floor(this.config.maxDataPoints * 0.1);
      this.dataBuffer.splice(0, removeCount);
    }
    
    this.dataBuffer.push(point);
    
    if (this.config.enableRealTime && !this.isProcessing) {
      this.processDataAsync();
    }
  }

  // Add multiple data points
  addDataPoints(points: HeatmapPoint[]): void {
    const startTime = Date.now();
    
    // Sample points if too many
    const sampledPoints = this.samplePoints(points);
    
    sampledPoints.forEach(point => this.addDataPoint(point));
    
    const processingTime = Date.now() - startTime;
    this.updatePerformanceMetrics(processingTime, 0);
  }

  // Sample points to reduce data volume
  private samplePoints(points: HeatmapPoint[]): HeatmapPoint[] {
    if (points.length <= this.config.maxDataPoints) {
      return points;
    }
    
    const step = Math.ceil(points.length / this.config.maxDataPoints);
    return points.filter((_, index) => index % step === 0);
  }

  // Process heatmap data
  async processData(filter?: HeatmapFilter): Promise<ProcessedHeatmapData> {
    const startTime = Date.now();
    this.isProcessing = true;

    try {
      // Filter data
      const filteredData = this.filterData(this.dataBuffer, filter);
      
      // Create grid
      const grid = this.createHeatmapGrid(filteredData);
      
      // Apply smoothing
      const smoothedGrid = this.applySmoothing(grid);
      
      // Detect hotspots
      const hotspots = this.detectHotspots(smoothedGrid);
      
      // Calculate metadata
      const metadata = this.calculateMetadata(filteredData, smoothedGrid, hotspots);
      
      // Calculate performance metrics
      const processingTime = Date.now() - startTime;
      const memoryUsage = this.estimateMemoryUsage();
      const dataLoss = this.calculateDataLoss(filteredData.length);
      
      this.processedData = {
        grid: smoothedGrid,
        metadata,
        performance: {
          processingTime,
          memoryUsage,
          dataLoss,
        },
      };

      return this.processedData;
    } finally {
      this.isProcessing = false;
    }
  }

  // Process data asynchronously
  private async processDataAsync(): Promise<void> {
    if (this.isProcessing) return;
    
    try {
      await this.processData();
    } catch (error) {
      console.error('Error processing heatmap data:', error);
    }
  }

  // Filter data based on criteria
  private filterData(data: HeatmapPoint[], filter?: HeatmapFilter): HeatmapPoint[] {
    if (!filter) return data;

    return data.filter(point => {
      // Type filter
      if (filter.type !== 'all' && point.type !== filter.type) {
        return false;
      }
      
      // Date range filter
      const pointDate = new Date(point.timestamp);
      if (pointDate < filter.dateRange.start || pointDate > filter.dateRange.end) {
        return false;
      }
      
      // Intensity filter
      if (point.intensity < filter.intensityRange.min || 
          point.intensity > filter.intensityRange.max) {
        return false;
      }
      
      return true;
    });
  }

  // Create heatmap grid from data points
  private createHeatmapGrid(points: HeatmapPoint[]): number[][] {
    const gridSize = this.config.gridSize;
    const maxX = Math.max(...points.map(p => p.x), window.innerWidth);
    const maxY = Math.max(...points.map(p => p.y), window.innerHeight);
    
    const cols = Math.ceil(maxX / gridSize);
    const rows = Math.ceil(maxY / gridSize);
    
    // Initialize grid
    const grid: number[][] = Array(rows).fill(null).map(() => Array(cols).fill(0));
    
    // Populate grid
    points.forEach(point => {
      const col = Math.floor(point.x / gridSize);
      const row = Math.floor(point.y / gridSize);
      
      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        grid[row][col] += point.intensity;
      }
    });
    
    return grid;
  }

  // Apply Gaussian smoothing to reduce noise
  private applySmoothing(grid: number[][]): number[][] {
    const radius = this.config.smoothingRadius;
    const sigma = radius / 3;
    const kernel = this.createGaussianKernel(radius, sigma);
    const kernelSize = kernel.length;
    const offset = Math.floor(kernelSize / 2);
    
    const rows = grid.length;
    const cols = grid[0].length;
    const smoothedGrid: number[][] = Array(rows).fill(null).map(() => Array(cols).fill(0));
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let weightedSum = 0;
        let kernelSum = 0;
        
        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const gridRow = row + ky - offset;
            const gridCol = col + kx - offset;
            
            if (gridRow >= 0 && gridRow < rows && gridCol >= 0 && gridCol < cols) {
              const weight = kernel[ky][kx];
              weightedSum += grid[gridRow][gridCol] * weight;
              kernelSum += weight;
            }
          }
        }
        
        smoothedGrid[row][col] = kernelSum > 0 ? weightedSum / kernelSum : 0;
      }
    }
    
    return smoothedGrid;
  }

  // Create Gaussian kernel for smoothing
  private createGaussianKernel(radius: number, sigma: number): number[][] {
    const size = Math.ceil(radius * 2) + 1;
    const kernel: number[][] = Array(size).fill(null).map(() => Array(size).fill(0));
    const center = Math.floor(size / 2);
    let sum = 0;
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - center;
        const dy = y - center;
        const value = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
        kernel[y][x] = value;
        sum += value;
      }
    }
    
    // Normalize kernel
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        kernel[y][x] /= sum;
      }
    }
    
    return kernel;
  }

  // Detect hotspots in the heatmap
  private detectHotspots(grid: number[][]): Array<{x: number; y: number; intensity: number; radius: number}> {
    const hotspots: Array<{x: number; y: number; intensity: number; radius: number}> = [];
    const threshold = this.config.intensityThreshold;
    const gridSize = this.config.gridSize;
    
    const rows = grid.length;
    const cols = grid[0].length;
    
    // Find local maxima
    for (let row = 1; row < rows - 1; row++) {
      for (let col = 1; col < cols - 1; col++) {
        const current = grid[row][col];
        
        if (current < threshold) continue;
        
        // Check if it's a local maximum
        const isLocalMax = 
          current >= grid[row - 1][col] &&
          current >= grid[row + 1][col] &&
          current >= grid[row][col - 1] &&
          current >= grid[row][col + 1];
        
        if (isLocalMax) {
          hotspots.push({
            x: col * gridSize + gridSize / 2,
            y: row * gridSize + gridSize / 2,
            intensity: current,
            radius: gridSize * 2,
          });
        }
      }
    }
    
    // Sort by intensity and limit number of hotspots
    return hotspots
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 50);
  }

  // Calculate metadata for the processed data
  private calculateMetadata(
    points: HeatmapPoint[], 
    grid: number[][], 
    hotspots: Array<{x: number; y: number; intensity: number; radius: number}>
  ) {
    const totalPoints = points.length;
    const averageIntensity = points.length > 0 
      ? points.reduce((sum, point) => sum + point.intensity, 0) / points.length 
      : 0;
    
    const maxIntensity = Math.max(...grid.flat());
    
    // Calculate coverage (percentage of grid cells with data)
    const nonEmptyCells = grid.flat().filter(cell => cell > 0).length;
    const totalCells = grid.length * grid[0].length;
    const coverage = (nonEmptyCells / totalCells) * 100;
    
    return {
      totalPoints,
      averageIntensity,
      maxIntensity,
      coverage,
      hotspots,
    };
  }

  // Estimate memory usage
  private estimateMemoryUsage(): number {
    const pointsSize = this.dataBuffer.length * 64; // Approximate bytes per point
    const gridSize = this.processedData?.grid.length * this.processedData.grid[0].length * 8 || 0;
    return pointsSize + gridSize;
  }

  // Calculate data loss percentage
  private calculateDataLoss(filteredCount: number): number {
    const originalCount = this.dataBuffer.length;
    if (originalCount === 0) return 0;
    
    return ((originalCount - filteredCount) / originalCount) * 100;
  }

  // Update performance metrics
  private updatePerformanceMetrics(processingTime: number, memoryUsage: number): void {
    // This could be sent to a monitoring service
    if (processingTime > 1000) {
      console.warn(`Slow heatmap processing: ${processingTime}ms`);
    }
  }

  // Get processed data
  getProcessedData(): ProcessedHeatmapData | null {
    return this.processedData;
  }

  // Get raw data buffer
  getDataBuffer(): HeatmapPoint[] {
    return [...this.dataBuffer];
  }

  // Clear data buffer
  clearData(): void {
    this.dataBuffer = [];
    this.processedData = null;
  }

  // Export data in various formats
  exportData(format: 'json' | 'csv' | 'png'): string | Blob {
    switch (format) {
      case 'json':
        return JSON.stringify({
          config: this.config,
          data: this.dataBuffer,
          processed: this.processedData,
        }, null, 2);
      
      case 'csv':
        return this.convertToCSV();
      
      case 'png':
        return this.convertToPNG();
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Convert data to CSV format
  private convertToCSV(): string {
    const headers = ['timestamp', 'x', 'y', 'intensity', 'type', 'element'];
    const rows = this.dataBuffer.map(point => [
      point.timestamp,
      point.x,
      point.y,
      point.intensity,
      point.type,
      point.element || '',
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // Convert to PNG image
  private convertToPNG(): Blob {
    // This would require canvas implementation
    // For now, return a placeholder
    return new Blob(['PNG implementation needed'], { type: 'image/png' });
  }

  // Update configuration
  updateConfig(newConfig: Partial<HeatmapConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Reprocess data if configuration changed significantly
    if (newConfig.gridSize || newConfig.smoothingRadius || newConfig.intensityThreshold) {
      this.processDataAsync();
    }
  }

  // Get current configuration
  getConfig(): HeatmapConfig {
    return { ...this.config };
  }

  // Get performance statistics
  getPerformanceStats() {
    return {
      bufferSize: this.dataBuffer.length,
      maxBufferSize: this.config.maxDataPoints,
      isProcessing: this.isProcessing,
      lastProcessed: this.processedData?.performance,
    };
  }

  // Compress old data to save memory
  compressData(): void {
    if (this.dataBuffer.length <= this.config.maxDataPoints * 0.8) return;
    
    const compressTo = Math.floor(this.config.maxDataPoints * this.config.compressionLevel);
    const step = Math.ceil(this.dataBuffer.length / compressTo);
    
    this.dataBuffer = this.dataBuffer.filter((_, index) => index % step === 0);
  }

  // Validate data integrity
  validateData(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    this.dataBuffer.forEach((point, index) => {
      if (typeof point.x !== 'number' || isNaN(point.x)) {
        errors.push(`Invalid x coordinate at index ${index}`);
      }
      if (typeof point.y !== 'number' || isNaN(point.y)) {
        errors.push(`Invalid y coordinate at index ${index}`);
      }
      if (typeof point.intensity !== 'number' || point.intensity < 0) {
        errors.push(`Invalid intensity at index ${index}`);
      }
      if (!['click', 'scroll', 'hover', 'movement'].includes(point.type)) {
        errors.push(`Invalid type at index ${index}: ${point.type}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Singleton instance for global use
let heatmapEngineInstance: HeatmapEngine | null = null;

export const getHeatmapEngine = (config?: Partial<HeatmapConfig>): HeatmapEngine => {
  if (!heatmapEngineInstance) {
    heatmapEngineInstance = new HeatmapEngine(config);
  }
  return heatmapEngineInstance;
};

export { HeatmapEngine, type HeatmapConfig, type HeatmapFilter, type ProcessedHeatmapData };
