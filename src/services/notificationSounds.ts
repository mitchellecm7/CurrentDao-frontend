import { NotificationType } from '../types/notifications';

export interface NotificationSoundConfig {
  type: NotificationType;
  src: string;
  volume: number;
  enabled: boolean;
}

class NotificationSoundService {
  private audioContext: AudioContext | null = null;
  private sounds: Map<NotificationType, HTMLAudioElement> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext not supported:', error);
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const soundConfigs: NotificationSoundConfig[] = [
      {
        type: 'info',
        src: '/sounds/notification-info.mp3',
        volume: 0.5,
        enabled: true
      },
      {
        type: 'success',
        src: '/sounds/notification-success.mp3',
        volume: 0.6,
        enabled: true
      },
      {
        type: 'warning',
        src: '/sounds/notification-warning.mp3',
        volume: 0.7,
        enabled: true
      },
      {
        type: 'error',
        src: '/sounds/notification-error.mp3',
        volume: 0.8,
        enabled: true
      }
    ];

    for (const config of soundConfigs) {
      try {
        const audio = new Audio(config.src);
        audio.preload = 'auto';
        audio.volume = config.volume;
        this.sounds.set(config.type, audio);
      } catch (error) {
        console.warn(`Failed to load sound for ${config.type}:`, error);
        // Create a fallback sound using Web Audio API
        this.createFallbackSound(config.type);
      }
    }

    this.isInitialized = true;
  }

  private createFallbackSound(type: NotificationType): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Different frequencies for different notification types
    const frequencies = {
      info: 800,
      success: 1000,
      warning: 600,
      error: 400
    };

    oscillator.frequency.setValueAtTime(frequencies[type], this.audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Create a mock audio element for consistency
    const mockAudio = {
      play: () => {
        oscillator.start();
        oscillator.stop(this.audioContext!.currentTime + 0.5);
        return Promise.resolve();
      },
      pause: () => {},
      volume: 0.5
    } as HTMLAudioElement;

    this.sounds.set(type, mockAudio);
  }

  public async playSound(type: NotificationType, volume?: number): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const audio = this.sounds.get(type);
    if (!audio) {
      console.warn(`No sound found for type: ${type}`);
      return;
    }

    try {
      // Resume audio context if suspended (required by some browsers)
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Set volume if provided
      if (volume !== undefined) {
        audio.volume = Math.max(0, Math.min(1, volume));
      }

      // Play the sound
      await audio.play();
    } catch (error) {
      console.warn(`Failed to play sound for ${type}:`, error);
      // Try fallback sound
      this.createFallbackSound(type);
      const fallbackAudio = this.sounds.get(type);
      if (fallbackAudio) {
        try {
          await fallbackAudio.play();
        } catch (fallbackError) {
          console.warn(`Fallback sound also failed for ${type}:`, fallbackError);
        }
      }
    }
  }

  public setVolume(type: NotificationType, volume: number): void {
    const audio = this.sounds.get(type);
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  public getVolume(type: NotificationType): number {
    const audio = this.sounds.get(type);
    return audio ? audio.volume : 0;
  }

  public stopAllSounds(): void {
    this.sounds.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        // Ignore errors when stopping sounds
      }
    });
  }

  public isSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }

  public async testSound(type: NotificationType): Promise<void> {
    await this.playSound(type);
  }

  public createCustomSound(frequency: number, duration: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'sine'): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const mockAudio = {
      play: () => {
        oscillator.start();
        oscillator.stop(this.audioContext!.currentTime + duration);
        return Promise.resolve();
      },
      pause: () => {},
      volume: 0.5
    } as HTMLAudioElement;

    this.sounds.set('info' as NotificationType, mockAudio);
  }

  public generateNotificationSound(type: NotificationType): void {
    const soundPatterns = {
      info: { frequency: 800, duration: 0.2, pattern: [0.2, 0.1, 0.2] },
      success: { frequency: 1000, duration: 0.15, pattern: [0.15, 0.1, 0.15, 0.1] },
      warning: { frequency: 600, duration: 0.3, pattern: [0.3, 0.2] },
      error: { frequency: 400, duration: 0.4, pattern: [0.4, 0.3, 0.4] }
    };

    const pattern = soundPatterns[type];
    if (!pattern || !this.audioContext) return;

    const playPattern = async (delays: number[]) => {
      for (const delay of delays) {
        this.createCustomSound(pattern.frequency, delay);
        await new Promise(resolve => setTimeout(resolve, delay * 1000));
      }
    };

    playPattern(pattern.pattern);
  }

  public dispose(): void {
    this.stopAllSounds();
    this.sounds.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.isInitialized = false;
  }
}

// Singleton instance
export const notificationSoundService = new NotificationSoundService();

// Hook for using notification sounds
export const useNotificationSounds = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsSupported(notificationSoundService.isSupported());
    
    notificationSoundService.initialize().then(() => {
      setIsInitialized(true);
    });

    return () => {
      notificationSoundService.dispose();
    };
  }, []);

  const playSound = useCallback(async (type: NotificationType, volume?: number) => {
    await notificationSoundService.playSound(type, volume);
  }, []);

  const testSound = useCallback(async (type: NotificationType) => {
    await notificationSoundService.testSound(type);
  }, []);

  const setVolume = useCallback((type: NotificationType, volume: number) => {
    notificationSoundService.setVolume(type, volume);
  }, []);

  const getVolume = useCallback((type: NotificationType) => {
    return notificationSoundService.getVolume(type);
  }, []);

  const generateCustomSound = useCallback((type: NotificationType) => {
    notificationSoundService.generateNotificationSound(type);
  }, []);

  return {
    isSupported,
    isInitialized,
    playSound,
    testSound,
    setVolume,
    getVolume,
    generateCustomSound
  };
};

// Import useState and useCallback for the hook
import { useState, useCallback, useEffect } from 'react';
