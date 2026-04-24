// Performance optimization utilities for 60fps chart rendering
export class ChartPerformanceOptimizer {
  private static frameCallback: number | null = null;
  private static lastFrameTime: number = 0;
  private static targetFPS: number = 60;
  private static frameInterval: number = 1000 / 60; // 16.67ms for 60fps

  // Throttled rendering for smooth performance
  static throttleRender(callback: () => void, fps: number = 60): () => void {
    const interval = 1000 / fps;
    let lastCall = 0;
    
    return (...args: any[]) => {
      const now = performance.now();
      if (now - lastCall >= interval) {
        lastCall = now;
        callback(...args);
      }
    };
  }

  // Debounced data processing
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Virtual scrolling for large datasets
  static createVirtualScrollRenderer(
    data: any[],
    itemHeight: number,
    containerHeight: number,
    renderItem: (item: any, index: number) => React.ReactNode
  ) {
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // Buffer for smooth scrolling
    const startIndex = 0;
    
    return {
      visibleItems: data.slice(startIndex, startIndex + visibleCount),
      startIndex,
      endIndex: startIndex + visibleCount,
      totalHeight: data.length * itemHeight,
      updateScrollPosition: (scrollTop: number) => {
        const newStartIndex = Math.floor(scrollTop / itemHeight);
        return {
          visibleItems: data.slice(newStartIndex, newStartIndex + visibleCount),
          startIndex: newStartIndex,
          endIndex: newStartIndex + visibleCount
        };
      }
    };
  }

  // Data chunking for progressive loading
  static chunkData<T>(data: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Memory-efficient data processing
  static processDataInChunks<T, R>(
    data: T[],
    processor: (chunk: T[]) => R[],
    chunkSize: number = 1000,
    onProgress?: (progress: number) => void
  ): Promise<R[]> {
    return new Promise((resolve) => {
      const results: R[] = [];
      const chunks = this.chunkData(data, chunkSize);
      let currentChunk = 0;
      
      const processChunk = () => {
        if (currentChunk >= chunks.length) {
          resolve(results);
          return;
        }
        
        const chunkResults = processor(chunks[currentChunk]);
        results.push(...chunkResults);
        currentChunk++;
        
        onProgress?.(currentChunk / chunks.length);
        
        // Use requestAnimationFrame for non-blocking processing
        requestAnimationFrame(processChunk);
      };
      
      processChunk();
    });
  }

  // Canvas-based rendering for high performance
  static createCanvasRenderer(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');
    
    return {
      clear: () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      },
      
      drawLine: (x1: number, y1: number, x2: number, y2: number, style: any) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = style.color || '#000';
        ctx.lineWidth = style.width || 1;
        ctx.stroke();
      },
      
      drawRect: (x: number, y: number, width: number, height: number, style: any) => {
        ctx.fillStyle = style.fillColor || 'transparent';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = style.strokeColor || '#000';
        ctx.lineWidth = style.strokeWidth || 1;
        ctx.strokeRect(x, y, width, height);
      },
      
      drawCircle: (x: number, y: number, radius: number, style: any) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = style.fillColor || 'transparent';
        ctx.fill();
        ctx.strokeStyle = style.strokeColor || '#000';
        ctx.lineWidth = style.strokeWidth || 1;
        ctx.stroke();
      },
      
      drawText: (text: string, x: number, y: number, style: any) => {
        ctx.font = style.font || '12px sans-serif';
        ctx.fillStyle = style.color || '#000';
        ctx.fillText(text, x, y);
      }
    };
  }

  // FPS monitoring
  static createFPSMonitor() {
    let frames = 0;
    let lastTime = performance.now();
    
    return {
      tick: () => {
        frames++;
        const currentTime = performance.now();
        if (currentTime >= lastTime + 1000) {
          const fps = Math.round((frames * 1000) / (currentTime - lastTime));
          frames = 0;
          lastTime = currentTime;
          return fps;
        }
        return null;
      },
      
      getFPS: () => {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        return deltaTime > 0 ? Math.round((frames * 1000) / deltaTime) : 0;
      }
    };
  }

  // Memory usage monitoring
  static getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usage: memory.usedJSHeapSize / memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  // Optimized data structures for chart rendering
  static createOptimizedDataStructure(data: any[]) {
    // Pre-calculate frequently used values
    const min = Math.min(...data.map(d => d.value));
    const max = Math.max(...data.map(d => d.value));
    const range = max - min;
    
    return {
      data,
      min,
      max,
      range,
      normalized: data.map(d => ({
        ...d,
        normalizedValue: (d.value - min) / range
      }))
    };
  }

  // Web Worker for background calculations
  static createWorkerProcessor<T, R>(
    workerScript: string,
    onMessage: (result: R) => void
  ) {
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    
    worker.onmessage = (event) => {
      onMessage(event.data);
    };
    
    return {
      process: (data: T) => {
        worker.postMessage(data);
      },
      
      terminate: () => {
        worker.terminate();
        URL.revokeObjectURL(blob);
      }
    };
  }

  // Intersection Observer for lazy loading
  static createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ) {
    return new IntersectionObserver(callback, {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });
  }

  // RequestIdleCallback for non-critical updates
  static scheduleIdleCallback(callback: () => void, timeout?: number) {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(callback, { timeout });
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(callback, timeout || 100);
    }
  }

  // Optimized event handlers
  static createOptimizedEventHandler<T extends Event>(
    handler: (event: T) => void,
    options?: { passive?: boolean; capture?: boolean }
  ) {
    return {
      add: (element: EventTarget, eventType: string) => {
        element.addEventListener(eventType, handler, {
          passive: true,
          ...options
        });
      },
      
      remove: (element: EventTarget, eventType: string) => {
        element.removeEventListener(eventType, handler, options);
      }
    };
  }

  // Cache for expensive calculations
  static createLRUCache<K, V>(maxSize: number = 100) {
    const cache = new Map<K, V>();
    
    return {
      get: (key: K): V | undefined => {
        const value = cache.get(key);
        if (value !== undefined) {
          // Move to end (most recently used)
          cache.delete(key);
          cache.set(key, value);
        }
        return value;
      },
      
      set: (key: K, value: V): void => {
        if (cache.size >= maxSize) {
          // Remove least recently used (first item)
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        cache.set(key, value);
      },
      
      has: (key: K): boolean => cache.has(key),
      
      clear: (): void => cache.clear(),
      
      size: (): number => cache.size
    };
  }

  // Performance metrics collector
  static createPerformanceCollector() {
    const metrics = {
      renderTime: [] as number[],
      fps: [] as number[],
      memoryUsage: [] as any[],
      dataProcessingTime: [] as number[]
    };
    
    return {
      recordRenderTime: (time: number) => {
        metrics.renderTime.push(time);
        if (metrics.renderTime.length > 100) metrics.renderTime.shift();
      },
      
      recordFPS: (fps: number) => {
        metrics.fps.push(fps);
        if (metrics.fps.length > 100) metrics.fps.shift();
      },
      
      recordMemoryUsage: () => {
        const usage = ChartPerformanceOptimizer.getMemoryUsage();
        if (usage) {
          metrics.memoryUsage.push(usage);
          if (metrics.memoryUsage.length > 100) metrics.memoryUsage.shift();
        }
      },
      
      recordDataProcessingTime: (time: number) => {
        metrics.dataProcessingTime.push(time);
        if (metrics.dataProcessingTime.length > 100) metrics.dataProcessingTime.shift();
      },
      
      getMetrics: () => ({
        averageRenderTime: metrics.renderTime.reduce((a, b) => a + b, 0) / metrics.renderTime.length || 0,
        averageFPS: metrics.fps.reduce((a, b) => a + b, 0) / metrics.fps.length || 0,
        currentMemoryUsage: metrics.memoryUsage[metrics.memoryUsage.length - 1],
        averageDataProcessingTime: metrics.dataProcessingTime.reduce((a, b) => a + b, 0) / metrics.dataProcessingTime.length || 0
      }),
      
      reset: () => {
        metrics.renderTime = [];
        metrics.fps = [];
        metrics.memoryUsage = [];
        metrics.dataProcessingTime = [];
      }
    };
  }
}

// Specific optimizations for chart rendering
export class ChartRendererOptimizer {
  private static canvasPool: HTMLCanvasElement[] = [];
  private static maxPoolSize = 5;

  // Canvas pooling for better performance
  static getCanvas(width: number, height: number): HTMLCanvasElement {
    let canvas = this.canvasPool.pop();
    
    if (!canvas) {
      canvas = document.createElement('canvas');
    }
    
    canvas.width = width;
    canvas.height = height;
    
    return canvas;
  }

  static returnCanvas(canvas: HTMLCanvasElement) {
    if (this.canvasPool.length < this.maxPoolSize) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      this.canvasPool.push(canvas);
    }
  }

  // Optimized line drawing with path caching
  static drawOptimizedLine(
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    style: any
  ) {
    if (points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    // Use quadratic curves for smoother lines
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    
    // Last point
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    
    ctx.strokeStyle = style.color || '#000';
    ctx.lineWidth = style.width || 1;
    ctx.stroke();
  }

  // Batch drawing operations
  static batchDrawOperations(
    ctx: CanvasRenderingContext2D,
    operations: (() => void)[]
  ) {
    ctx.save();
    operations.forEach(op => op());
    ctx.restore();
  }

  // Viewport culling for performance
  static cullDataToViewport(
    data: any[],
    viewport: { startX: number; endX: number; startY: number; endY: number }
  ) {
    return data.filter(point => 
      point.x >= viewport.startX && 
      point.x <= viewport.endX && 
      point.y >= viewport.startY && 
      point.y <= viewport.endY
    );
  }

  // Level of Detail (LOD) for zoom levels
  static getLODData(
    data: any[],
    zoomLevel: number,
    maxPoints: number = 1000
  ) {
    if (data.length <= maxPoints) return data;
    
    const step = Math.ceil(data.length / maxPoints);
    const lodData = [];
    
    for (let i = 0; i < data.length; i += step) {
      lodData.push(data[i]);
    }
    
    return lodData;
  }
}

// Export performance utilities
export const createPerformanceMonitor = () => {
  const fpsMonitor = ChartPerformanceOptimizer.createFPSMonitor();
  const collector = ChartPerformanceOptimizer.createPerformanceCollector();
  
  return {
    startFrame: () => performance.now(),
    endFrame: (startTime: number) => {
      const renderTime = performance.now() - startTime;
      collector.recordRenderTime(renderTime);
      
      const fps = fpsMonitor.tick();
      if (fps) {
        collector.recordFPS(fps);
      }
    },
    
    getMetrics: () => collector.getMetrics(),
    reset: () => collector.reset()
  };
};

export const optimizeChartData = (data: any[], options: {
  maxPoints?: number;
  enableLOD?: boolean;
  zoomLevel?: number;
} = {}) => {
  const { maxPoints = 10000, enableLOD = true, zoomLevel = 1 } = options;
  
  if (data.length <= maxPoints) return data;
  
  if (enableLOD) {
    return ChartRendererOptimizer.getLODData(data, zoomLevel, maxPoints);
  }
  
  // Simple sampling
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0);
};
