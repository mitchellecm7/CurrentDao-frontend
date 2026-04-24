/**
 * Voice Interface Component
 * Provides voice interaction support for trading commands
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Search, ChevronDown } from 'lucide-react';
import { VoiceCommand, VoiceInteraction } from '../../types/ai';

interface VoiceInterfaceProps {
  onCommand?: (command: VoiceCommand) => void;
  onInteraction?: (interaction: VoiceInteraction) => void;
  enabled?: boolean;
  showSettings?: boolean;
  language?: string;
  className?: string;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onCommand,
  onInteraction,
  enabled = true,
  showSettings = true,
  language = 'en-US',
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interactions, setInteractions] = useState<VoiceInteraction[]>([]);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;
      
      recognitionRef.current.onresult = handleSpeechResult;
      recognitionRef.current.onerror = handleSpeechError;
      recognitionRef.current.onend = handleSpeechEnd;
    } else if (typeof window !== 'undefined' && 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;
      
      recognitionRef.current.onresult = handleSpeechResult;
      recognitionRef.current.onerror = handleSpeechError;
      recognitionRef.current.onend = handleSpeechEnd;
    } else {
      setRecognitionSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [language]);

  const handleSpeechResult = (event: any) => {
    const current = event.resultIndex;
    const transcript = event.results[current][0].transcript;
    const confidence = event.results[current][0].confidence;
    
    setTranscript(transcript);
    setConfidence(confidence || 0);

    if (event.results[current].isFinal) {
      processVoiceCommand(transcript, confidence || 0);
    }
  };

  const handleSpeechError = (event: any) => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
    
    const interaction: VoiceInteraction = {
      id: generateId(),
      transcript,
      intent: 'error',
      confidence: 0,
      response: `Speech recognition error: ${event.error}`,
      timestamp: new Date(),
      successful: false
    };
    
    setInteractions(prev => [...prev, interaction]);
    onInteraction?.(interaction);
  };

  const handleSpeechEnd = () => {
    setIsListening(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const processVoiceCommand = async (transcript: string, confidence: number) => {
    setIsProcessing(true);
    
    try {
      const command = parseVoiceCommand(transcript, confidence);
      
      const interaction: VoiceInteraction = {
        id: generateId(),
        transcript,
        intent: command.intent,
        confidence: command.confidence,
        response: generateCommandResponse(command),
        timestamp: new Date(),
        successful: command.confidence > 0.7
      };
      
      setInteractions(prev => [...prev, interaction]);
      onInteraction?.(interaction);
      onCommand?.(command);
      
      // Provide audio feedback
      if (!isMuted) {
        speakResponse(interaction.response);
      }
    } catch (error) {
      console.error('Command processing failed:', error);
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  };

  const parseVoiceCommand = (transcript: string, confidence: number): VoiceCommand => {
    const lowerTranscript = transcript.toLowerCase();
    
    // Common trading commands
    if (lowerTranscript.includes('buy') || lowerTranscript.includes('purchase')) {
      const asset = extractAsset(lowerTranscript);
      return {
        command: transcript,
        intent: 'buy',
        parameters: { asset, amount: extractAmount(lowerTranscript) },
        confidence,
        timestamp: new Date()
      };
    }
    
    if (lowerTranscript.includes('sell') || lowerTranscript.includes('exit')) {
      const asset = extractAsset(lowerTranscript);
      return {
        command: transcript,
        intent: 'sell',
        parameters: { asset, amount: extractAmount(lowerTranscript) },
        confidence,
        timestamp: new Date()
      };
    }
    
    if (lowerTranscript.includes('market') && lowerTranscript.includes('analysis')) {
      return {
        command: transcript,
        intent: 'market_analysis',
        parameters: { timeframe: extractTimeframe(lowerTranscript) },
        confidence,
        timestamp: new Date()
      };
    }
    
    if (lowerTranscript.includes('recommendation') || lowerTranscript.includes('recommend')) {
      return {
        command: transcript,
        intent: 'recommendation',
        parameters: { asset: extractAsset(lowerTranscript) },
        confidence,
        timestamp: new Date()
      };
    }
    
    if (lowerTranscript.includes('portfolio') || lowerTranscript.includes('holdings')) {
      return {
        command: transcript,
        intent: 'portfolio_status',
        parameters: {},
        confidence,
        timestamp: new Date()
      };
    }
    
    if (lowerTranscript.includes('risk') || lowerTranscript.includes('risk assessment')) {
      return {
        command: transcript,
        intent: 'risk_assessment',
        parameters: { asset: extractAsset(lowerTranscript) },
        confidence,
        timestamp: new Date()
      };
    }
    
    // Default to general query
    return {
      command: transcript,
      intent: 'query',
      parameters: { query: transcript },
      confidence: confidence * 0.5, // Lower confidence for unknown commands
      timestamp: new Date()
    };
  };

  const extractAsset = (transcript: string): string => {
    const assets = ['bitcoin', 'btc', 'ethereum', 'eth', 'energy', 'solana', 'sol', 'cardano', 'ada'];
    const found = assets.find(asset => transcript.includes(asset));
    return found ? found.toUpperCase() : 'UNKNOWN';
  };

  const extractAmount = (transcript: string): number => {
    const numbers = transcript.match(/\d+/);
    return numbers ? parseInt(numbers[0]) : 0;
  };

  const extractTimeframe = (transcript: string): string => {
    if (transcript.includes('day')) return '1d';
    if (transcript.includes('week')) return '1w';
    if (transcript.includes('month')) return '1m';
    return '1d';
  };

  const generateCommandResponse = (command: VoiceCommand): string => {
    switch (command.intent) {
      case 'buy':
        return `Preparing to buy ${command.parameters.asset}. Please confirm the transaction.`;
      case 'sell':
        return `Preparing to sell ${command.parameters.asset}. Please confirm the transaction.`;
      case 'market_analysis':
        return `Analyzing market conditions for ${command.parameters.timeframe || '1d'} timeframe.`;
      case 'recommendation':
        return `Generating trading recommendation for ${command.parameters.asset || 'your portfolio'}.`;
      case 'portfolio_status':
        return 'Retrieving your current portfolio status and performance metrics.';
      case 'risk_assessment':
        return `Analyzing risk factors for ${command.parameters.asset || 'your portfolio'}.`;
      case 'query':
        return `Processing your query: "${command.command}"`;
      default:
        return 'Command received. Processing...';
    }
  };

  const startListening = async () => {
    if (!recognitionRef.current || !recognitionSupported) return;

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio analysis for visualization
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      
      // Start visualization
      visualizeAudio();
      
      // Start speech recognition
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
    } catch (error) {
      console.error('Failed to start listening:', error);
      setRecognitionSupported(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsListening(false);
    setVolumeLevel(0);
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    setVolumeLevel(average / 255);
    
    animationFrameRef.current = requestAnimationFrame(visualizeAudio);
  };

  const speakResponse = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };

  const getIntentColor = (intent: string): string => {
    switch (intent) {
      case 'buy': return 'text-green-600';
      case 'sell': return 'text-red-600';
      case 'market_analysis': return 'text-blue-600';
      case 'recommendation': return 'text-purple-600';
      case 'portfolio_status': return 'text-indigo-600';
      case 'risk_assessment': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (!enabled) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users size={24} />
            <div>
              <h3 className="text-lg font-semibold">Voice Trading Assistant</h3>
              <p className="text-purple-100 text-sm">Speak your trading commands</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {showSettings && (
              <button
                onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <Search size={16} />
              </button>
            )}
            <button
              onClick={toggleMute}
              className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              {isMuted ? <X size={16} /> : <Search size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Voice Control */}
      <div className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Microphone Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isListening ? stopListening : startListening}
            disabled={!recognitionSupported || isProcessing}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-colors ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : recognitionSupported
                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isListening ? (
              <>
                <X size={32} />
                {/* Volume indicator */}
                <div className="absolute inset-0 rounded-full border-4 border-purple-300 opacity-50" />
                <div 
                  className="absolute inset-0 rounded-full border-4 border-purple-500"
                  style={{
                    transform: `scale(${1 + volumeLevel * 0.3})`,
                    opacity: 0.7
                  }}
                />
              </>
            ) : (
              <Users size={32} />
            )}
          </motion.button>

          {/* Status */}
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">
              {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Tap to speak'}
            </p>
            {transcript && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-gray-600 mt-2"
              >
                "{transcript}"
              </motion.p>
            )}
            {confidence > 0 && (
              <div className="flex items-center justify-center space-x-2 mt-2">
                <span className="text-sm text-gray-500">Confidence:</span>
                <div className="flex items-center space-x-1">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Volume Level */}
          {isListening && (
            <div className="w-full max-w-xs">
              <div className="flex items-center space-x-2">
                <Search size={16} className="text-gray-500" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-100"
                    style={{ width: `${volumeLevel * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Interactions */}
        {interactions.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Recent Voice Commands</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {interactions.slice(-5).reverse().map((interaction) => (
                <motion.div
                  key={interaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg ${
                    interaction.successful 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        "{interaction.transcript}"
                      </p>
                      <p className={`text-sm mt-1 ${getIntentColor(interaction.intent)}`}>
                        {interaction.intent.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {interaction.response}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`w-2 h-2 rounded-full ${
                        interaction.successful ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <p className="text-xs text-gray-500 mt-1">
                        {interaction.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettingsPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t bg-gray-50 p-4"
          >
            <h4 className="font-semibold text-gray-900 mb-3">Voice Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => {
                    // Language change would require reinitializing recognition
                    console.log('Language changed to:', e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Audio Feedback</span>
                <button
                  onClick={toggleMute}
                  className={`w-12 h-6 rounded-full ${
                    !isMuted ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    !isMuted ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="text-xs text-gray-500">
                {recognitionSupported 
                  ? 'Speech recognition is supported and ready to use.'
                  : 'Speech recognition is not supported in your browser.'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInterface;
