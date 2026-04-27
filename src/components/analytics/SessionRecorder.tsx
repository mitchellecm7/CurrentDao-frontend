import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  Download, 
  Settings, 
  Eye, 
  EyeOff,
  Shield,
  AlertTriangle,
  Clock,
  MousePointer,
  Monitor,
  Calendar,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX
} from 'lucide-react';

interface SessionEvent {
  id: string;
  timestamp: number;
  type: 'click' | 'scroll' | 'mousemove' | 'keypress' | 'focus' | 'blur' | 'resize' | 'visibilitychange';
  data: {
    x?: number;
    y?: number;
    target?: string;
    key?: string;
    scrollX?: number;
    scrollY?: number;
    width?: number;
    height?: number;
    hidden?: boolean;
  };
  viewport: {
    width: number;
    height: number;
  };
}

interface SessionRecording {
  id: string;
  sessionId: string;
  userId?: string;
  startTime: string;
  endTime: string;
  duration: number;
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
  stats: {
    totalEvents: number;
    clicks: number;
    scrolls: number;
    keypresses: number;
    mouseMovements: number;
    pageViews: number;
    averageSessionTime: number;
    bounceRate: number;
  };
}

interface SessionRecorderProps {
  isRecording?: boolean;
  hasConsent?: boolean;
  onConsentChange?: (consent: boolean) => void;
  onRecordingToggle?: (recording: boolean) => void;
  recordings?: SessionRecording[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  onExport?: (recordingId: string) => void;
  onDelete?: (recordingId: string) => void;
  privacyMode?: boolean;
}

export const SessionRecorder: React.FC<SessionRecorderProps> = ({
  isRecording = false,
  hasConsent = false,
  onConsentChange,
  onRecordingToggle,
  recordings = [],
  isLoading = false,
  error = null,
  className = '',
  onExport,
  onDelete,
  privacyMode = true,
}) => {
  const [selectedRecording, setSelectedRecording] = useState<SessionRecording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'click' | 'scroll' | 'mousemove'>('all');
  const [volume, setVolume] = useState(0);
  const playbackInterval = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const filteredRecordings = recordings.filter(recording => {
    const matchesSearch = recording.metadata.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recording.sessionId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleConsent = (granted: boolean) => {
    onConsentChange?.(granted);
  };

  const toggleRecording = () => {
    if (!hasConsent) {
      handleConsent(true);
    }
    onRecordingToggle?.(!isRecording);
  };

  const playRecording = useCallback((recording: SessionRecording) => {
    setSelectedRecording(recording);
    setCurrentEventIndex(0);
    setIsPlaying(true);
  }, []);

  const pauseRecording = () => {
    setIsPlaying(false);
    if (playbackInterval.current) {
      clearInterval(playbackInterval.current);
    }
  };

  const stopRecording = () => {
    setIsPlaying(false);
    setCurrentEventIndex(0);
    if (playbackInterval.current) {
      clearInterval(playbackInterval.current);
    }
  };

  const replayEvent = useCallback((event: SessionEvent) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    switch (event.type) {
      case 'click':
        if (event.data.x && event.data.y) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(event.data.x, event.data.y, 10, 0, 2 * Math.PI);
          ctx.stroke();
          
          ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
          ctx.fill();
        }
        break;
      
      case 'mousemove':
        if (event.data.x && event.data.y) {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
          ctx.beginPath();
          ctx.arc(event.data.x, event.data.y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
        break;
      
      case 'scroll':
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.8)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(10, 10, canvasRef.current.width - 20, 30);
        ctx.setLineDash([]);
        
        if (event.data.scrollY !== undefined) {
          const scrollPercent = (event.data.scrollY / 100) * (canvasRef.current.height - 40);
          ctx.fillStyle = 'rgba(251, 146, 60, 0.6)';
          ctx.fillRect(12, 12 + scrollPercent, canvasRef.current.width - 24, 26 - scrollPercent);
        }
        break;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '12px monospace';
    ctx.fillText(
      `${event.type} at ${new Date(event.timestamp).toLocaleTimeString()}`,
      10,
      canvasRef.current.height - 10
    );
  }, []);

  useEffect(() => {
    if (isPlaying && selectedRecording) {
      playbackInterval.current = setInterval(() => {
        setCurrentEventIndex(prev => {
          const next = prev + 1;
          if (next >= selectedRecording.events.length) {
            setIsPlaying(false);
            return 0;
          }
          
          const event = selectedRecording.events[next];
          replayEvent(event);
          
          return next;
        });
      }, 100 / playbackSpeed);
    } else {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
    }

    return () => {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
    };
  }, [isPlaying, selectedRecording, playbackSpeed, replayEvent]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getRecordingStats = (recording: SessionRecording) => {
    const events = recording.events;
    return {
      clicks: events.filter(e => e.type === 'click').length,
      scrolls: events.filter(e => e.type === 'scroll').length,
      mouseMovements: events.filter(e => e.type === 'mousemove').length,
      keypresses: events.filter(e => e.type === 'keypress').length,
    };
  };

  if (!hasConsent) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Session Recording Consent</h3>
          <p className="text-gray-600 mb-6">
            Help us improve CurrentDao by allowing us to record your interactions for analysis. 
            All data is anonymized and stored securely according to GDPR standards.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-medium text-gray-900 mb-2">What we record:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Clicks and mouse movements</li>
              <li>• Scroll behavior</li>
              <li>• Page navigation patterns</li>
              <li>• Session duration and timing</li>
            </ul>
            <h4 className="font-medium text-gray-900 mb-2 mt-4">What we don't record:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Personal information</li>
              <li>• Passwords or sensitive data</li>
              <li>• Form inputs</li>
              <li>• External website content</li>
            </ul>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleConsent(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => handleConsent(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Accept & Enable
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Session Recording</h2>
            <p className="text-sm text-gray-500">
              {isRecording ? 'Recording in progress...' : `${recordings.length} recordings available`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleRecording}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isRecording 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Recording
                </>
              )}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-gray-200 p-4 bg-gray-50"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="privacyMode"
                checked={privacyMode}
                onChange={(e) => onConsentChange?.(!e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="privacyMode" className="text-sm font-medium text-gray-700">
                Privacy Mode (Anonymize data)
              </label>
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">
                Consent Status: {hasConsent ? 'Granted' : 'Denied'}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="border-b border-gray-200 p-4 bg-red-50">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {selectedRecording && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium text-gray-900">Session: {selectedRecording.sessionId}</h3>
              <p className="text-sm text-gray-500">
                {selectedRecording.metadata.url} • {formatDuration(selectedRecording.duration)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentEventIndex(Math.max(0, currentEventIndex - 1))}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={stopRecording}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentEventIndex(selectedRecording.events.length - 1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentEventIndex(0)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={4}>4x</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Event {currentEventIndex + 1} of {selectedRecording.events.length}</span>
              <span>{formatDuration(selectedRecording.events[currentEventIndex]?.timestamp || 0)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentEventIndex + 1) / selectedRecording.events.length) * 100}%` }}
              />
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full border border-gray-300 rounded-lg bg-white"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search recordings by URL or session ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Recordings</option>
            <option value="click">Click Events</option>
            <option value="scroll">Scroll Events</option>
            <option value="mousemove">Mouse Events</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-3 text-blue-600">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading recordings...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecordings.map((recording) => {
              const stats = getRecordingStats(recording);
              return (
                <motion.div
                  key={recording.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{recording.sessionId}</h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {formatDuration(recording.duration)}
                        </span>
                        {recording.metadata.consent && (
                          <Shield className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{recording.metadata.url}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MousePointer className="w-3 h-3" />
                          {stats.clicks} clicks
                        </span>
                        <span className="flex items-center gap-1">
                          <Monitor className="w-3 h-3" />
                          {stats.scrolls} scrolls
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(recording.startTime).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => playRecording(recording)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onExport?.(recording.id)}
                        className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete?.(recording.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {filteredRecordings.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <Monitor className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recordings found</p>
                <p className="text-sm">Start recording to capture user sessions</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
