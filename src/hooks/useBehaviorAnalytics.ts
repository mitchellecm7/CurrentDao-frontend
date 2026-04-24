import { useState, useEffect, useCallback, useRef } from 'react';
import { HeatmapData, SessionRecording, UserFlow, ABTest } from '@/types/analytics';

interface BehaviorAnalyticsConfig {
  enableHeatmap: boolean;
  enableSessionRecording: boolean;
  enableUserFlowTracking: boolean;
  enableABTesting: boolean;
  privacyMode: boolean;
  sampleRate: number;
  batchSize: number;
  flushInterval: number;
  apiEndpoint: string;
}

interface AnalyticsEvent {
  id: string;
  type: 'click' | 'scroll' | 'mousemove' | 'keypress' | 'focus' | 'blur' | 'pageview' | 'conversion';
  timestamp: number;
  data: any;
  url: string;
  userId?: string;
  sessionId: string;
  viewport: {
    width: number;
    height: number;
  };
}

interface UseBehaviorAnalyticsReturn {
  // Configuration
  config: BehaviorAnalyticsConfig;
  updateConfig: (newConfig: Partial<BehaviorAnalyticsConfig>) => void;
  
  // Consent Management
  hasConsent: boolean;
  grantConsent: () => void;
  revokeConsent: () => void;
  
  // Data Collection
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  
  // Heatmap Data
  heatmapData: HeatmapData | null;
  heatmapLoading: boolean;
  heatmapError: string | null;
  fetchHeatmapData: (filters?: any) => Promise<void>;
  
  // Session Recording
  isRecording: boolean;
  sessionRecordings: SessionRecording[];
  recordingsLoading: boolean;
  recordingsError: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  fetchRecordings: () => Promise<void>;
  
  // User Flow Analysis
  userFlows: UserFlow[];
  flowsLoading: boolean;
  flowsError: string | null;
  fetchUserFlows: () => Promise<void>;
  
  // A/B Testing
  abTests: ABTest[];
  testsLoading: boolean;
  testsError: string | null;
  fetchABTests: () => Promise<void>;
  
  // Performance Monitoring
  performanceMetrics: {
    dataLoss: number;
    processingTime: number;
    memoryUsage: number;
    networkLatency: number;
  };
  
  // Utilities
  trackEvent: (event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'>) => void;
  flushEvents: () => Promise<void>;
  exportData: (type: 'heatmap' | 'sessions' | 'flows' | 'tests', format: 'json' | 'csv') => Promise<void>;
}

const defaultConfig: BehaviorAnalyticsConfig = {
  enableHeatmap: true,
  enableSessionRecording: true,
  enableUserFlowTracking: true,
  enableABTesting: true,
  privacyMode: true,
  sampleRate: 0.1,
  batchSize: 50,
  flushInterval: 30000,
  apiEndpoint: '/api/analytics',
};

export const useBehaviorAnalytics = (initialConfig?: Partial<BehaviorAnalyticsConfig>): UseBehaviorAnalyticsReturn => {
  const [config, setConfig] = useState<BehaviorAnalyticsConfig>({ ...defaultConfig, ...initialConfig });
  const [hasConsent, setHasConsent] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Data states
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatmapError, setHeatmapError] = useState<string | null>(null);
  
  const [sessionRecordings, setSessionRecordings] = useState<SessionRecording[]>([]);
  const [recordingsLoading, setRecordingsLoading] = useState(false);
  const [recordingsError, setRecordingsError] = useState<string | null>(null);
  
  const [userFlows, setUserFlows] = useState<UserFlow[]>([]);
  const [flowsLoading, setFlowsLoading] = useState(false);
  const [flowsError, setFlowsError] = useState<string | null>(null);
  
  const [abTests, setABTests] = useState<ABTest[]>([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [testsError, setTestsError] = useState<string | null>(null);
  
  const [performanceMetrics, setPerformanceMetrics] = useState({
    dataLoss: 0,
    processingTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
  });

  // Refs for tracking
  const sessionIdRef = useRef<string>('');
  const eventBufferRef = useRef<AnalyticsEvent[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const performanceStartRef = useRef<number>(Date.now());

  // Generate session ID
  const generateSessionId = useCallback(() => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }, []);

  // Initialize session
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = generateSessionId();
    }
  }, [generateSessionId]);

  // Configuration management
  const updateConfig = useCallback((newConfig: Partial<BehaviorAnalyticsConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Consent management
  const grantConsent = useCallback(() => {
    setHasConsent(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics_consent', 'granted');
    }
  }, []);

  const revokeConsent = useCallback(() => {
    setHasConsent(false);
    setIsTracking(false);
    setIsRecording(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics_consent', 'denied');
    }
  }, []);

  // Check for existing consent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedConsent = localStorage.getItem('analytics_consent');
      if (storedConsent === 'granted') {
        setHasConsent(true);
      }
    }
  }, []);

  // Event tracking
  const trackEvent = useCallback((event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'>) => {
    if (!hasConsent || !isTracking) return;

    const fullEvent: AnalyticsEvent = {
      ...event,
      id: 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      sessionId: sessionIdRef.current,
    };

    eventBufferRef.current.push(fullEvent);

    // Batch processing
    if (eventBufferRef.current.length >= config.batchSize) {
      flushEvents();
    }
  }, [hasConsent, isTracking, config.batchSize]);

  // Flush events to server
  const flushEvents = useCallback(async () => {
    if (eventBufferRef.current.length === 0) return;

    const events = [...eventBufferRef.current];
    eventBufferRef.current = [];

    try {
      const startTime = Date.now();
      
      const response = await fetch(`${config.apiEndpoint}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          sessionId: sessionIdRef.current,
          privacyMode: config.privacyMode,
        }),
      });

      const processingTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update performance metrics
      setPerformanceMetrics(prev => ({
        ...prev,
        processingTime: Math.max(prev.processingTime, processingTime),
        networkLatency: processingTime,
      }));

    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      
      // Re-add events to buffer for retry
      eventBufferRef.current = [...events, ...eventBufferRef.current];
      
      // Update data loss metric
      setPerformanceMetrics(prev => ({
        ...prev,
        dataLoss: prev.dataLoss + events.length,
      }));
    }
  }, [config.apiEndpoint, config.privacyMode]);

  // Auto-flush timer
  useEffect(() => {
    if (isTracking && hasConsent) {
      flushTimeoutRef.current = setInterval(() => {
        flushEvents();
      }, config.flushInterval);

      return () => {
        if (flushTimeoutRef.current) {
          clearInterval(flushTimeoutRef.current);
        }
      };
    }
  }, [isTracking, hasConsent, config.flushInterval, flushEvents]);

  // Tracking control
  const startTracking = useCallback(() => {
    if (!hasConsent) {
      grantConsent();
    }
    setIsTracking(true);
  }, [hasConsent, grantConsent]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    flushEvents(); // Flush remaining events
  }, [flushEvents]);

  // Heatmap data fetching
  const fetchHeatmapData = useCallback(async (filters?: any) => {
    if (!hasConsent) return;

    setHeatmapLoading(true);
    setHeatmapError(null);

    try {
      const queryParams = new URLSearchParams(filters || {}).toString();
      const response = await fetch(`${config.apiEndpoint}/heatmap?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setHeatmapData(data);
    } catch (error) {
      setHeatmapError(error instanceof Error ? error.message : 'Failed to fetch heatmap data');
    } finally {
      setHeatmapLoading(false);
    }
  }, [hasConsent, config.apiEndpoint]);

  // Session recording
  const startRecording = useCallback(() => {
    if (!hasConsent) {
      grantConsent();
    }
    setIsRecording(true);
  }, [hasConsent, grantConsent]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  const fetchRecordings = useCallback(async () => {
    if (!hasConsent) return;

    setRecordingsLoading(true);
    setRecordingsError(null);

    try {
      const response = await fetch(`${config.apiEndpoint}/recordings`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSessionRecordings(data);
    } catch (error) {
      setRecordingsError(error instanceof Error ? error.message : 'Failed to fetch recordings');
    } finally {
      setRecordingsLoading(false);
    }
  }, [hasConsent, config.apiEndpoint]);

  // User flow analysis
  const fetchUserFlows = useCallback(async () => {
    if (!hasConsent) return;

    setFlowsLoading(true);
    setFlowsError(null);

    try {
      const response = await fetch(`${config.apiEndpoint}/flows`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUserFlows(data);
    } catch (error) {
      setFlowsError(error instanceof Error ? error.message : 'Failed to fetch user flows');
    } finally {
      setFlowsLoading(false);
    }
  }, [hasConsent, config.apiEndpoint]);

  // A/B testing
  const fetchABTests = useCallback(async () => {
    if (!hasConsent) return;

    setTestsLoading(true);
    setTestsError(null);

    try {
      const response = await fetch(`${config.apiEndpoint}/ab-tests`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setABTests(data);
    } catch (error) {
      setTestsError(error instanceof Error ? error.message : 'Failed to fetch A/B tests');
    } finally {
      setTestsLoading(false);
    }
  }, [hasConsent, config.apiEndpoint]);

  // Data export
  const exportData = useCallback(async (type: 'heatmap' | 'sessions' | 'flows' | 'tests', format: 'json' | 'csv') => {
    if (!hasConsent) return;

    try {
      const response = await fetch(`${config.apiEndpoint}/export/${type}?format=${format}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  }, [hasConsent, config.apiEndpoint]);

  // Performance monitoring
  useEffect(() => {
    const updatePerformanceMetrics = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const memory = (performance as any).memory;
        
        setPerformanceMetrics(prev => ({
          ...prev,
          memoryUsage: memory ? memory.usedJSHeapSize : 0,
        }));
      }
    };

    const interval = setInterval(updatePerformanceMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-tracking setup
  useEffect(() => {
    if (!isTracking || !hasConsent) return;

    // Page view tracking
    trackEvent({
      type: 'pageview',
      data: {
        title: document.title,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      },
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });

    // Click tracking
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      trackEvent({
        type: 'click',
        data: {
          x: event.clientX,
          y: event.clientY,
          target: target.tagName.toLowerCase(),
          className: target.className,
          id: target.id,
          text: target.textContent?.slice(0, 100),
        },
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });
    };

    // Scroll tracking
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        trackEvent({
          type: 'scroll',
          data: {
            scrollY: window.scrollY,
            scrollX: window.scrollX,
            scrollHeight: document.documentElement.scrollHeight,
            clientHeight: document.documentElement.clientHeight,
          },
          url: window.location.href,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        });
      }, 100);
    };

    // Mouse movement tracking (sampled)
    let mouseTimeout: NodeJS.Timeout;
    const handleMouseMove = (event: MouseEvent) => {
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        if (Math.random() < config.sampleRate) {
          trackEvent({
            type: 'mousemove',
            data: {
              x: event.clientX,
              y: event.clientY,
            },
            url: window.location.href,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight,
            },
          });
        }
      }, 50);
    };

    // Add event listeners
    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(scrollTimeout);
      clearTimeout(mouseTimeout);
    };
  }, [isTracking, hasConsent, config.sampleRate, trackEvent]);

  return {
    // Configuration
    config,
    updateConfig,
    
    // Consent Management
    hasConsent,
    grantConsent,
    revokeConsent,
    
    // Data Collection
    isTracking,
    startTracking,
    stopTracking,
    
    // Heatmap Data
    heatmapData,
    heatmapLoading,
    heatmapError,
    fetchHeatmapData,
    
    // Session Recording
    isRecording,
    sessionRecordings,
    recordingsLoading,
    recordingsError,
    startRecording,
    stopRecording,
    fetchRecordings,
    
    // User Flow Analysis
    userFlows,
    flowsLoading,
    flowsError,
    fetchUserFlows,
    
    // A/B Testing
    abTests,
    testsLoading,
    testsError,
    fetchABTests,
    
    // Performance Monitoring
    performanceMetrics,
    
    // Utilities
    trackEvent,
    flushEvents,
    exportData,
  };
};
