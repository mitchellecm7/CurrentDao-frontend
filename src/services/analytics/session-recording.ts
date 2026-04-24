import { SessionEvent, SessionRecording } from '@/types/analytics';

interface SessionRecordingConfig {
  maxRecordingDuration: number; // in milliseconds
  maxEventsPerSession: number;
  samplingRate: number; // 0.0 to 1.0
  compressionEnabled: boolean;
  privacyMode: boolean;
  sensitiveDataFilters: string[];
  recordClicks: boolean;
  recordScrolls: boolean;
  recordMouseMovements: boolean;
  recordKeypresses: boolean;
  recordFormInputs: boolean;
  recordNetworkRequests: boolean;
  recordConsoleErrors: boolean;
  batchSize: number;
  flushInterval: number;
  storageQuota: number; // in bytes
}

interface RecordingSession {
  id: string;
  startTime: number;
  endTime?: number;
  events: SessionEvent[];
  metadata: {
    userAgent: string;
    url: string;
    referrer?: string;
    screenResolution: string;
    timezone: string;
    consent: boolean;
    anonymized: boolean;
  };
  isActive: boolean;
  performance: {
    eventCount: number;
    dataLoss: number;
    processingTime: number;
    memoryUsage: number;
  };
}

class SessionRecordingService {
  private config: SessionRecordingConfig;
  private currentSession: RecordingSession | null = null;
  private eventBuffer: SessionEvent[] = [];
  private isRecording = false;
  private recordingStartTime = 0;
  private eventListeners: Map<string, EventListener> = new Map();
  private flushTimer: NodeJS.Timeout | null = null;
  private storageKey = 'session_recordings';

  constructor(config: Partial<SessionRecordingConfig> = {}) {
    this.config = {
      maxRecordingDuration: 30 * 60 * 1000, // 30 minutes
      maxEventsPerSession: 10000,
      samplingRate: 0.1,
      compressionEnabled: true,
      privacyMode: true,
      sensitiveDataFilters: ['password', 'credit-card', 'ssn', 'email'],
      recordClicks: true,
      recordScrolls: true,
      recordMouseMovements: true,
      recordKeypresses: false, // Disabled by default for privacy
      recordFormInputs: false, // Disabled by default for privacy
      recordNetworkRequests: true,
      recordConsoleErrors: true,
      batchSize: 100,
      flushInterval: 5000,
      storageQuota: 50 * 1024 * 1024, // 50MB
      ...config,
    };
  }

  // Start recording a new session
  startRecording(consent: boolean = false): string {
    if (this.isRecording) {
      throw new Error('Recording is already in progress');
    }

    const sessionId = this.generateSessionId();
    const now = Date.now();

    this.currentSession = {
      id: sessionId,
      startTime: now,
      events: [],
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        consent,
        anonymized: this.config.privacyMode,
      },
      isActive: true,
      performance: {
        eventCount: 0,
        dataLoss: 0,
        processingTime: 0,
        memoryUsage: 0,
      },
    };

    this.isRecording = true;
    this.recordingStartTime = now;
    this.setupEventListeners();
    this.startFlushTimer();

    // Auto-stop recording after max duration
    setTimeout(() => {
      if (this.isRecording) {
        this.stopRecording();
      }
    }, this.config.maxRecordingDuration);

    return sessionId;
  }

  // Stop current recording
  stopRecording(): SessionRecording | null {
    if (!this.isRecording || !this.currentSession) {
      return null;
    }

    this.isRecording = false;
    this.currentSession.endTime = Date.now();
    this.currentSession.isActive = false;
    this.removeEventListeners();
    this.stopFlushTimer();

    // Flush remaining events
    this.flushEvents();

    const recording = this.convertToSessionRecording(this.currentSession);
    this.saveRecording(recording);

    this.currentSession = null;
    this.eventBuffer = [];

    return recording;
  }

  // Check if recording is active
  isRecordingActive(): boolean {
    return this.isRecording;
  }

  // Get current session info
  getCurrentSession(): RecordingSession | null {
    return this.currentSession;
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Setup event listeners
  private setupEventListeners(): void {
    if (!this.currentSession) return;

    // Click events
    if (this.config.recordClicks) {
      const clickHandler = (event: MouseEvent) => {
        this.recordClick(event);
      };
      document.addEventListener('click', clickHandler);
      this.eventListeners.set('click', clickHandler);
    }

    // Scroll events
    if (this.config.recordScrolls) {
      let scrollTimeout: NodeJS.Timeout;
      const scrollHandler = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.recordScroll();
        }, 100);
      };
      window.addEventListener('scroll', scrollHandler, { passive: true });
      this.eventListeners.set('scroll', scrollHandler);
    }

    // Mouse movement events (sampled)
    if (this.config.recordMouseMovements) {
      let mouseTimeout: NodeJS.Timeout;
      const mouseHandler = (event: MouseEvent) => {
        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => {
          if (Math.random() < this.config.samplingRate) {
            this.recordMouseMove(event);
          }
        }, 50);
      };
      document.addEventListener('mousemove', mouseHandler, { passive: true });
      this.eventListeners.set('mousemove', mouseHandler);
    }

    // Keypress events
    if (this.config.recordKeypresses) {
      const keyHandler = (event: KeyboardEvent) => {
        this.recordKeypress(event);
      };
      document.addEventListener('keypress', keyHandler);
      this.eventListeners.set('keypress', keyHandler);
    }

    // Form input events
    if (this.config.recordFormInputs) {
      const focusHandler = (event: FocusEvent) => {
        this.recordFocus(event, 'focus');
      };
      const blurHandler = (event: FocusEvent) => {
        this.recordFocus(event, 'blur');
      };
      document.addEventListener('focus', focusHandler, true);
      document.addEventListener('blur', blurHandler, true);
      this.eventListeners.set('focus', focusHandler);
      this.eventListeners.set('blur', blurHandler);
    }

    // Window resize events
    const resizeHandler = () => {
      this.recordResize();
    };
    window.addEventListener('resize', resizeHandler);
    this.eventListeners.set('resize', resizeHandler);

    // Visibility change events
    const visibilityHandler = () => {
      this.recordVisibilityChange();
    };
    document.addEventListener('visibilitychange', visibilityHandler);
    this.eventListeners.set('visibilitychange', visibilityHandler);

    // Console error events
    if (this.config.recordConsoleErrors) {
      const errorHandler = (event: ErrorEvent) => {
        this.recordError(event);
      };
      window.addEventListener('error', errorHandler);
      this.eventListeners.set('error', errorHandler);
    }
  }

  // Remove event listeners
  private removeEventListeners(): void {
    this.eventListeners.forEach((listener, event) => {
      if (event === 'focus' || event === 'blur') {
        document.removeEventListener(event, listener, true);
      } else {
        const target = event === 'resize' || event === 'error' ? window : document;
        target.removeEventListener(event, listener);
      }
    });
    this.eventListeners.clear();
  }

  // Record click event
  private recordClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    this.addEvent({
      id: this.generateEventId(),
      timestamp: Date.now() - this.recordingStartTime,
      type: 'click',
      data: {
        x: event.clientX,
        y: event.clientY,
        target: this.getSafeElementInfo(target),
        button: event.button,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });
  }

  // Record scroll event
  private recordScroll(): void {
    this.addEvent({
      id: this.generateEventId(),
      timestamp: Date.now() - this.recordingStartTime,
      type: 'scroll',
      data: {
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });
  }

  // Record mouse movement
  private recordMouseMove(event: MouseEvent): void {
    this.addEvent({
      id: this.generateEventId(),
      timestamp: Date.now() - this.recordingStartTime,
      type: 'mousemove',
      data: {
        x: event.clientX,
        y: event.clientY,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });
  }

  // Record keypress
  private recordKeypress(event: KeyboardEvent): void {
    // Skip sensitive data
    if (this.isSensitiveInput(event.target as HTMLElement)) {
      return;
    }

    this.addEvent({
      id: this.generateEventId(),
      timestamp: Date.now() - this.recordingStartTime,
      type: 'keypress',
      data: {
        key: event.key,
        code: event.code,
        target: this.getSafeElementInfo(event.target as HTMLElement),
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });
  }

  // Record focus/blur events
  private recordFocus(event: FocusEvent, type: 'focus' | 'blur'): void {
    const target = event.target as HTMLElement;
    this.addEvent({
      id: this.generateEventId(),
      timestamp: Date.now() - this.recordingStartTime,
      type,
      data: {
        target: this.getSafeElementInfo(target),
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });
  }

  // Record window resize
  private recordResize(): void {
    this.addEvent({
      id: this.generateEventId(),
      timestamp: Date.now() - this.recordingStartTime,
      type: 'resize',
      data: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });
  }

  // Record visibility change
  private recordVisibilityChange(): void {
    this.addEvent({
      id: this.generateEventId(),
      timestamp: Date.now() - this.recordingStartTime,
      type: 'visibilitychange',
      data: {
        hidden: document.hidden,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });
  }

  // Record console error
  private recordError(event: ErrorEvent): void {
    this.addEvent({
      id: this.generateEventId(),
      timestamp: Date.now() - this.recordingStartTime,
      type: 'error',
      data: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });
  }

  // Add event to current session
  private addEvent(event: SessionEvent): void {
    if (!this.currentSession || !this.isRecording) return;

    // Check event limit
    if (this.currentSession.events.length >= this.config.maxEventsPerSession) {
      this.currentSession.performance.dataLoss++;
      return;
    }

    // Anonymize data if privacy mode is enabled
    if (this.config.privacyMode) {
      event = this.anonymizeEvent(event);
    }

    this.currentSession.events.push(event);
    this.currentSession.performance.eventCount++;
  }

  // Generate event ID
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get safe element information (excluding sensitive data)
  private getSafeElementInfo(element: HTMLElement): string {
    if (!element) return '';

    const tagName = element.tagName.toLowerCase();
    const className = element.className || '';
    const id = element.id || '';
    
    // Skip sensitive attributes
    if (this.isSensitiveInput(element)) {
      return `${tagName}.sensitive`;
    }

    let selector = tagName;
    if (className) {
      selector += `.${className.split(' ').join('.')}`;
    }
    if (id) {
      selector += `#${id}`;
    }

    // Add text content for non-input elements (truncated)
    if (!['input', 'textarea', 'select'].includes(tagName) && element.textContent) {
      const text = element.textContent.trim().substring(0, 50);
      if (text) {
        selector += `[text="${text}"]`;
      }
    }

    return selector;
  }

  // Check if element contains sensitive data
  private isSensitiveInput(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    const type = (element as HTMLInputElement).type || '';
    const className = element.className || '';
    const name = (element as HTMLInputElement).name || '';
    const id = element.id || '';

    const sensitivePatterns = this.config.sensitiveDataFilters;
    const sensitiveTypes = ['password', 'credit-card', 'cc', 'ssn', 'social-security'];

    return (
      sensitiveTypes.includes(type) ||
      sensitivePatterns.some(pattern => 
        className.includes(pattern) || name.includes(pattern) || id.includes(pattern)
      )
    );
  }

  // Anonymize event data
  private anonymizeEvent(event: SessionEvent): SessionEvent {
    const anonymized = { ...event };

    // Remove or hash any potentially sensitive data
    if (event.data.text) {
      event.data.text = this.hashString(event.data.text);
    }

    if (event.data.value) {
      event.data.value = this.hashString(event.data.value);
    }

    return anonymized;
  }

  // Hash string for anonymization
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `hash_${Math.abs(hash)}`;
  }

  // Start flush timer
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.flushInterval);
  }

  // Stop flush timer
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // Flush events to storage
  private flushEvents(): void {
    if (!this.currentSession || this.eventBuffer.length === 0) return;

    // In a real implementation, this would send to server
    // For now, we'll just clear the buffer
    this.eventBuffer = [];
  }

  // Convert recording session to session recording format
  private convertToSessionRecording(session: RecordingSession): SessionRecording {
    const duration = (session.endTime || Date.now()) - session.startTime;
    
    const stats = {
      totalEvents: session.events.length,
      clicks: session.events.filter(e => e.type === 'click').length,
      scrolls: session.events.filter(e => e.type === 'scroll').length,
      keypresses: session.events.filter(e => e.type === 'keypress').length,
      mouseMovements: session.events.filter(e => e.type === 'mousemove').length,
      pageViews: 1, // Single page view for this implementation
      averageSessionTime: duration,
      bounceRate: 0, // Would need more data to calculate
    };

    return {
      id: session.id,
      sessionId: session.id,
      startTime: new Date(session.startTime).toISOString(),
      endTime: new Date(session.endTime || Date.now()).toISOString(),
      duration,
      events: session.events,
      metadata: session.metadata,
      stats,
    };
  }

  // Save recording to local storage
  private saveRecording(recording: SessionRecording): void {
    try {
      const recordings = this.getStoredRecordings();
      recordings.push(recording);
      
      // Limit storage usage
      if (this.getStorageSize(recordings) > this.config.storageQuota) {
        recordings.shift(); // Remove oldest recording
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(recordings));
    } catch (error) {
      console.error('Failed to save recording:', error);
    }
  }

  // Get stored recordings
  private getStoredRecordings(): SessionRecording[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load recordings:', error);
      return [];
    }
  }

  // Calculate storage size
  private getStorageSize(recordings: SessionRecording[]): number {
    return JSON.stringify(recordings).length * 2; // Approximate bytes
  }

  // Get all recordings
  getRecordings(): SessionRecording[] {
    return this.getStoredRecordings();
  }

  // Get recording by ID
  getRecording(id: string): SessionRecording | null {
    const recordings = this.getStoredRecordings();
    return recordings.find(r => r.id === id) || null;
  }

  // Delete recording
  deleteRecording(id: string): boolean {
    try {
      const recordings = this.getStoredRecordings();
      const filtered = recordings.filter(r => r.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete recording:', error);
      return false;
    }
  }

  // Clear all recordings
  clearAllRecordings(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear recordings:', error);
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<SessionRecordingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): SessionRecordingConfig {
    return { ...this.config };
  }

  // Get recording statistics
  getRecordingStats(): {
    totalRecordings: number;
    totalEvents: number;
    storageUsed: number;
    isRecording: boolean;
    currentSessionDuration?: number;
  } {
    const recordings = this.getStoredRecordings();
    const totalEvents = recordings.reduce((sum, r) => sum + r.events.length, 0);
    const storageUsed = this.getStorageSize(recordings);

    return {
      totalRecordings: recordings.length,
      totalEvents,
      storageUsed,
      isRecording: this.isRecording,
      currentSessionDuration: this.currentSession 
        ? Date.now() - this.currentSession.startTime 
        : undefined,
    };
  }
}

// Singleton instance
let sessionRecordingInstance: SessionRecordingService | null = null;

export const getSessionRecordingService = (config?: Partial<SessionRecordingConfig>): SessionRecordingService => {
  if (!sessionRecordingInstance) {
    sessionRecordingInstance = new SessionRecordingService(config);
  }
  return sessionRecordingInstance;
};

export { SessionRecordingService, type SessionRecordingConfig, type RecordingSession };
