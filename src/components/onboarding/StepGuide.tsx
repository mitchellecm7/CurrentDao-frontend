'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, LayoutDashboard, ShoppingCart, Wallet, Sparkles } from 'lucide-react';
import { TutorialStep } from '../../types/onboarding';

interface StepGuideProps {
  step: TutorialStep;
  currentStepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

const icons: Record<string, React.ReactNode> = {
  welcome: <Sparkles className="h-6 w-6 text-emerald-500" />,
  dashboard: <LayoutDashboard className="h-6 w-6 text-blue-500" />,
  trading: <ShoppingCart className="h-6 w-6 text-amber-500" />,
  wallets: <Wallet className="h-6 w-6 text-purple-500" />,
  conclusion: <Sparkles className="h-6 w-6 text-emerald-500" />,
};

const StepGuide: React.FC<StepGuideProps> = ({
  step,
  currentStepIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  onNext,
  onPrev,
  onSkip,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 overflow-hidden"
        >
          {/* Progress Indicator */}
          <div className="absolute top-0 left-0 h-1 bg-muted w-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
              className="h-full bg-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-xl">
                {icons[step.id] || <Sparkles className="h-6 w-6" />}
              </div>
              <h3 className="text-xl font-black text-foreground">{step.title}</h3>
            </div>
            <button
              onClick={onSkip}
              className="p-1 hover:bg-secondary rounded-full text-muted-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-muted-foreground leading-relaxed mb-8">
            {step.content}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-4">
              {!isFirstStep && (
                <button
                  onClick={onPrev}
                  className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={onNext}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
                  ${isLastStep ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-primary text-primary-foreground hover:opacity-90'}
                `}
              >
                {isLastStep ? 'Get Started' : 'Next Step'}
                {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Step Count */}
          <div className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-40">
            Step {currentStepIndex + 1} of {totalSteps}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StepGuide;
