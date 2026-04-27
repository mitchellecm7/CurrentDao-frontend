/**
 * Voice Commands Hook
 * Provides voice command functionality for trading operations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceCommand, VoiceInteraction } from '../types/ai';

interface UseVoiceCommandsOptions {
  enabled?: boolean;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onCommand?: (command: VoiceCommand) => void;
  onInteraction?: (interaction: VoiceInteraction) => void;
}

interface UseVoiceCommandsReturn {
  // State
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  confidence: number;
  interactions: VoiceInteraction[];
  isSupported: boolean;
  
  // Actions
  startListening: () => Promise<void>;
  stopListening: () => void;
  toggleListening: () => void;
  
  // Settings
  setLanguage: (language: string) => void;
  setContinuous: (continuous: boolean) => void;
  
  // Utilities
  clearInteractions: () => void;
  getSupportedLanguages: () => string[];
}

export function useVoiceCommands(options: UseVoiceCommandsOptions = {}): UseVoiceCommandsReturn {
  const {
    enabled = true,
    language = 'en-US',
    continuous = true,
    interimResults = true,
    onCommand,
    onInteraction
  } = options;

  // State management
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [interactions, setInteractions] = useState<VoiceInteraction[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [isContinuousMode, setIsContinuousMode] = useState(continuous);

  // Refs
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || 
                              (window as any).SpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        setupRecognition();
      } else {
        setIsSupported(false);
        console.warn('Speech recognition not supported in this browser');
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const setupRecognition = () => {
    if (!recognitionRef.current) return;

    recognitionRef.current.continuous = isContinuousMode;
    recognitionRef.current.interimResults = interimResults;
    recognitionRef.current.lang = currentLanguage;

    recognitionRef.current.onresult = handleResult;
    recognitionRef.current.onerror = handleError;
    recognitionRef.current.onstart = handleStart;
    recognitionRef.current.onend = handleEnd;
    recognitionRef.current.onsoundstart = handleSoundStart;
    recognitionRef.current.onsoundend = handleSoundEnd;
    recognitionRef.current.onspeechstart = handleSpeechStart;
    recognitionRef.current.onspeechend = handleSpeechEnd;
    recognitionRef.current.onnomatch = handleNoMatch;
  };

  const handleResult = (event: any) => {
    const current = event.resultIndex;
    const result = event.results[current];
    const transcript = result[0].transcript;
    const confidence = result[0].confidence;

    setTranscript(transcript);
    setConfidence(confidence || 0);

    if (result.isFinal) {
      processVoiceCommand(transcript, confidence || 0);
    }
  };

  const handleError = (event: any) => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
    setIsProcessing(false);

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

  const handleStart = () => {
    setIsListening(true);
    setIsProcessing(false);
  };

  const handleEnd = () => {
    setIsListening(false);
    setIsProcessing(false);
  };

  const handleSoundStart = () => {
    // Sound detected
  };

  const handleSoundEnd = () => {
    // Sound ended
  };

  const handleSpeechStart = () => {
    // Speech detected
  };

  const handleSpeechEnd = () => {
    // Speech ended
  };

  const handleNoMatch = () => {
    // No match found
    setTranscript('');
    setConfidence(0);
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
      speakResponse(interaction.response);

    } catch (error) {
      console.error('Command processing failed:', error);
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  };

  const parseVoiceCommand = (transcript: string, confidence: number): VoiceCommand => {
    const lowerTranscript = transcript.toLowerCase();
    
    // Trading commands
    if (lowerTranscript.includes('buy') || lowerTranscript.includes('purchase')) {
      return {
        command: transcript,
        intent: 'buy',
        parameters: {
          asset: extractAsset(lowerTranscript),
          amount: extractAmount(lowerTranscript),
          price: extractPrice(lowerTranscript)
        },
        confidence,
        timestamp: new Date()
      };
    }
    
    if (lowerTranscript.includes('sell') || lowerTranscript.includes('exit')) {
      return {
        command: transcript,
        intent: 'sell',
        parameters: {
          asset: extractAsset(lowerTranscript),
          amount: extractAmount(lowerTranscript),
          price: extractPrice(lowerTranscript)
        },
        confidence,
        timestamp: new Date()
      };
    }

    if (lowerTranscript.includes('market') && lowerTranscript.includes('analysis')) {
      return {
        command: transcript,
        intent: 'market_analysis',
        parameters: {
          timeframe: extractTimeframe(lowerTranscript),
          assets: extractAssets(lowerTranscript)
        },
        confidence,
        timestamp: new Date()
      };
    }

    if (lowerTranscript.includes('recommendation') || lowerTranscript.includes('recommend')) {
      return {
        command: transcript,
        intent: 'recommendation',
        parameters: {
          asset: extractAsset(lowerTranscript),
          timeframe: extractTimeframe(lowerTranscript)
        },
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
        parameters: {
          asset: extractAsset(lowerTranscript)
        },
        confidence,
        timestamp: new Date()
      };
    }

    if (lowerTranscript.includes('price') || lowerTranscript.includes('current price')) {
      return {
        command: transcript,
        intent: 'price_check',
        parameters: {
          asset: extractAsset(lowerTranscript)
        },
        confidence,
        timestamp: new Date()
      };
    }

    if (lowerTranscript.includes('chart') || lowerTranscript.includes('show chart')) {
      return {
        command: transcript,
        intent: 'show_chart',
        parameters: {
          asset: extractAsset(lowerTranscript),
          timeframe: extractTimeframe(lowerTranscript)
        },
        confidence,
        timestamp: new Date()
      };
    }

    // Default to general query
    return {
      command: transcript,
      intent: 'query',
      parameters: { query: transcript },
      confidence: confidence * 0.5,
      timestamp: new Date()
    };
  };

  const extractAsset = (transcript: string): string => {
    const assets = ['bitcoin', 'btc', 'ethereum', 'eth', 'energy', 'solana', 'sol', 'cardano', 'ada'];
    const found = assets.find(asset => transcript.includes(asset));
    return found ? found.toUpperCase() : 'UNKNOWN';
  };

  const extractAssets = (transcript: string): string[] => {
    const assets = ['bitcoin', 'btc', 'ethereum', 'eth', 'energy', 'solana', 'sol', 'cardano', 'ada'];
    return assets.filter(asset => transcript.includes(asset)).map(asset => asset.toUpperCase());
  };

  const extractAmount = (transcript: string): number => {
    const numbers = transcript.match(/\d+/);
    return numbers ? parseInt(numbers[0]) : 0;
  };

  const extractPrice = (transcript: string): number => {
    const priceMatch = transcript.match(/\$?(\d+(?:\.\d+)?)/);
    return priceMatch ? parseFloat(priceMatch[1]) : 0;
  };

  const extractTimeframe = (transcript: string): string => {
    if (transcript.includes('day') || transcript.includes('daily')) return '1d';
    if (transcript.includes('week') || transcript.includes('weekly')) return '1w';
    if (transcript.includes('month') || transcript.includes('monthly')) return '1m';
    if (transcript.includes('hour') || transcript.includes('hourly')) return '1h';
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
      case 'price_check':
        return `Checking current price for ${command.parameters.asset || 'assets'}.`;
      case 'show_chart':
        return `Displaying chart for ${command.parameters.asset || 'portfolio'}.`;
      case 'query':
        return `Processing your query: "${command.command}"`;
      default:
        return 'Command received. Processing...';
    }
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

  const startListening = async (): Promise<void> => {
    if (!enabled || !recognitionRef.current || !isSupported) {
      throw new Error('Voice commands not supported or enabled');
    }

    try {
      // Request microphone access
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start listening:', error);
      setIsSupported(false);
      throw error;
    }
  };

  const stopListening = (): void => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const toggleListening = (): void => {
    if (isListening) {
      stopListening();
    } else {
      startListening().catch(console.error);
    }
  };

  const setLanguage = (newLanguage: string): void => {
    setCurrentLanguage(newLanguage);
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLanguage;
    }
  };

  const setContinuous = (continuous: boolean): void => {
    setIsContinuousMode(continuous);
    if (recognitionRef.current) {
      recognitionRef.current.continuous = continuous;
    }
  };

  const clearInteractions = (): void => {
    setInteractions([]);
  };

  const getSupportedLanguages = (): string[] => {
    return [
      'en-US',
      'en-GB',
      'es-ES',
      'fr-FR',
      'de-DE',
      'it-IT',
      'pt-BR',
      'ja-JP',
      'ko-KR',
      'zh-CN'
    ];
  };

  const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };

  return {
    // State
    isListening,
    isProcessing,
    transcript,
    confidence,
    interactions,
    isSupported,

    // Actions
    startListening,
    stopListening,
    toggleListening,

    // Settings
    setLanguage,
    setContinuous,

    // Utilities
    clearInteractions,
    getSupportedLanguages
  };
}
