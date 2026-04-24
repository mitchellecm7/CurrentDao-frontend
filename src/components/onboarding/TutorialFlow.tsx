'use client';

import React from 'react';
import { useOnboarding } from '../../hooks/useOnboarding';
import StepGuide from './StepGuide';

const TutorialFlow: React.FC = () => {
  const {
    isTutorialActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    skipTutorial,
  } = useOnboarding();

  if (!isTutorialActive || !currentStep) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <StepGuide
        step={currentStep}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipTutorial}
      />
    </div>
  );
};

export default TutorialFlow;
