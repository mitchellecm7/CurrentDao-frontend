'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  CheckCircle,
  X,
  ArrowRight,
  ArrowLeft,
  MousePointer,
  Hand,
  Eye,
  Zap,
  Target,
  Sparkles
} from 'lucide-react';
import { TutorialStep, InteractiveTutorial as ITutorial } from '../../types/onboarding';

interface InteractiveTutorialProps {
  tutorial: ITutorial;
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onStepChange: (stepIndex: number) => void;
  showControls?: boolean;
  allowSkip?: boolean;
  autoAdvance?: boolean;
}

interface TutorialOverlayProps {
  step: TutorialStep;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  isLastStep: boolean;
  isFirstStep: boolean;
  showControls: boolean;
  allowSkip: boolean;
}

interface InteractiveElementProps {
  element: HTMLElement;
  action: TutorialStep['action'];
  onComplete: () => void;
  highlight?: boolean;
  spotlight?: boolean;
}

const InteractiveElement: React.FC<InteractiveElementProps> = ({
  element,
  action,
  onComplete,
  highlight = false,
  spotlight = false
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    if (!element) return;

    const handleInteraction = () => {
      setIsInteracting(true);
      setTimeout(() => {
        setIsCompleted(true);
        onComplete();
      }, 500);
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleInteraction();
      }
    };

    if (action === 'click') {
      element.addEventListener('click', handleInteraction);
      element.addEventListener('keydown', handleKeydown);
      element.style.cursor = 'pointer';
      element.setAttribute('role', 'button');
      element.setAttribute('tabindex', '0');
    } else if (action === 'input') {
      element.addEventListener('input', handleInteraction);
      element.addEventListener('keydown', handleKeydown);
      element.focus();
    }

    return () => {
      element.removeEventListener('click', handleInteraction);
      element.removeEventListener('input', handleInteraction);
      element.removeEventListener('keydown', handleKeydown);
      element.style.cursor = '';
      element.removeAttribute('role');
      element.removeAttribute('tabindex');
    };
  }, [element, action, onComplete]);

  return (
    <>
      {highlight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 border-4 border-blue-500 rounded-lg pointer-events-none"
          style={{
            boxShadow: '0 0 0 9999px rgba(59, 130, 246, 0.3)',
            zIndex: 9998
          }}
        />
      )}
      {spotlight && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            zIndex: 9997
          }}
        />
      )}
      {isInteracting && !isCompleted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {action === 'click' ? 'Click here!' : 'Type here!'}
          </div>
        </motion.div>
      )}
      {isCompleted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-green-500 text-white p-2 rounded-full">
            <CheckCircle className="w-6 h-6" />
          </div>
        </motion.div>
      )}
    </>
  );
};

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  step,
  onNext,
  onPrevious,
  onSkip,
  isLastStep,
  isFirstStep,
  showControls,
  allowSkip
}) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    if (step.targetId) {
      const element = document.getElementById(step.targetId);
      setTargetElement(element || null);
    } else {
      setTargetElement(null);
    }
  }, [step.targetId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleStepComplete = useCallback(() => {
    setIsCompleted(true);
    setTimeout(() => {
      onNext();
    }, 1000);
  }, [onNext]);

  const getPosition = () => {
    if (!targetElement) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const rect = targetElement.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const margin = 20;

    let top = rect.top;
    let left = rect.left;

    switch (step.position) {
      case 'top':
        top = rect.top - tooltipHeight - margin;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + margin;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - margin;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + margin;
        break;
    }

    // Keep tooltip within viewport
    if (left < margin) left = margin;
    if (left + tooltipWidth > window.innerWidth - margin) {
      left = window.innerWidth - tooltipWidth - margin;
    }
    if (top < margin) top = margin;
    if (top + tooltipHeight > window.innerHeight - margin) {
      top = window.innerHeight - tooltipHeight - margin;
    }

    return { top: `${top}px`, left: `${left}px`, transform: 'none' };
  };

  const getTooltipIcon = () => {
    const icons: Record<string, React.ReactNode> = {
      welcome: <Sparkles className="w-6 h-6" />,
      goals: <Target className="w-6 h-6" />,
      dashboard: <Eye className="w-6 h-6" />,
      trading: <Zap className="w-6 h-6" />,
      wallet: <Hand className="w-6 h-6" />,
      'first-trade': <MousePointer className="w-6 h-6" />,
    };
    return icons[step.id] || <Sparkles className="w-6 h-6" />;
  };

  return (
    <AnimatePresence>
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed z-50 pointer-events-none"
          style={getPosition()}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-sm pointer-events-auto">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600 flex-shrink-0">
                {getTooltipIcon()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.content}</p>
              </div>
              {allowSkip && (
                <button
                  onClick={onSkip}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>

            {step.media && (
              <div className="mb-4">
                {step.media.type === 'image' && (
                  <img
                    src={step.media.url}
                    alt={step.media.alt}
                    className="w-full rounded-lg"
                  />
                )}
              </div>
            )}

            {showControls && (
              <div className="flex items-center justify-between">
                <div>
                  {!isFirstStep && (
                    <button
                      onClick={onPrevious}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {step.action && targetElement ? (
                    <div className="text-sm text-gray-500">
                      {step.action === 'click' ? 'Click the highlighted element' : 'Interact with the highlighted element'}
                    </div>
                  ) : (
                    <button
                      onClick={onNext}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      {isLastStep ? 'Complete' : 'Next'}
                      {!isLastStep && <ArrowRight className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Arrow pointing to target */}
          {targetElement && (
            <div
              className="absolute w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"
              style={{
                ...(step.position === 'top' && {
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(45deg)'
                }),
                ...(step.position === 'bottom' && {
                  top: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(-135deg)'
                }),
                ...(step.position === 'left' && {
                  right: '-8px',
                  top: '50%',
                  transform: 'translateY(-50%) rotate(135deg)'
                }),
                ...(step.position === 'right' && {
                  left: '-8px',
                  top: '50%',
                  transform: 'translateY(-50%) rotate(-45deg)'
                })
              }}
            />
          )}
        </motion.div>
      )}

      {targetElement && step.interactions && (
        <InteractiveElement
          element={targetElement}
          action={step.action || 'none'}
          onComplete={handleStepComplete}
          highlight={step.interactions.highlight}
          spotlight={step.interactions.spotlight}
        />
      )}
    </AnimatePresence>
  );
};

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  tutorial,
  isActive,
  onComplete,
  onSkip,
  onStepChange,
  showControls = true,
  allowSkip = true,
  autoAdvance = false
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = tutorial.steps[currentStepIndex];
  const isLastStep = currentStepIndex === tutorial.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  useEffect(() => {
    if (isActive && !startTime) {
      setStartTime(new Date());
    }
  }, [isActive, startTime]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  useEffect(() => {
    onStepChange(currentStepIndex);
  }, [currentStepIndex, onStepChange]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [isLastStep, onComplete]);

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [isFirstStep]);

  const handleSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleMuteToggle = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentStepIndex(0);
    setTimeSpent(0);
    setStartTime(new Date());
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentStepIndex + 1) / tutorial.steps.length) * 100;

  if (!isActive) return null;

  return (
    <div className={`fixed inset-0 z-50 ${isFullscreen ? 'bg-black' : 'bg-black/40 backdrop-blur-sm'}`}>
      {/* Tutorial Controls */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 space-y-3"
        >
          {/* Progress Bar */}
          {showProgressBar && (
            <div className="w-48">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Step {currentStepIndex + 1}</span>
                <span>{tutorial.steps.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="bg-blue-500 h-2 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Time Display */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            {formatTime(timeSpent)}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Restart Tutorial"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={handlePlayPause}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={handleMuteToggle}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handleFullscreenToggle}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Skip Button */}
          {allowSkip && (
            <button
              onClick={handleSkip}
              className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip Tutorial
            </button>
          )}
        </motion.div>
      )}

      {/* Tutorial Content */}
      <TutorialOverlay
        step={currentStep}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={handleSkip}
        isLastStep={isLastStep}
        isFirstStep={isFirstStep}
        showControls={showControls}
        allowSkip={allowSkip}
      />

      {/* Tutorial Info Panel */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute bottom-4 left-4 z-50 bg-white rounded-lg shadow-lg p-4 max-w-xs"
        >
          <h3 className="font-semibold text-gray-900 mb-2">{tutorial.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{tutorial.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {tutorial.difficulty}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {tutorial.estimatedTime} min
            </div>
            {tutorial.interactive && (
              <div className="flex items-center gap-1">
                <Hand className="w-3 h-3" />
                Interactive
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InteractiveTutorial;
