import { useState, useEffect, useRef } from 'react';
import { useTutorial } from '../context/TutorialContext';
import { cn } from '../utils/helpers';

const TutorialOverlay = () => {
  const { 
    isActive, 
    currentStep, 
    currentStepData, 
    nextStep, 
    prevStep, 
    completeTutorial,
    totalSteps 
  } = useTutorial();
  
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [targetRect, setTargetRect] = useState(null);
  const tooltipRef = useRef(null);

  // Find and highlight target element
  useEffect(() => {
    if (!isActive || !currentStepData) return;

    const findTarget = () => {
      const target = document.querySelector(currentStepData.target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        
        // Calculate tooltip position based on placement
        const tooltipHeight = 180;
        const tooltipWidth = 320;
        const padding = 16;
        
        let top = 0;
        let left = 0;
        
        switch (currentStepData.placement) {
          case 'bottom':
            top = rect.bottom + padding;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            break;
          case 'top':
            top = rect.top - tooltipHeight - padding;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            break;
          case 'right':
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.right + padding;
            break;
          case 'left':
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.left - tooltipWidth - padding;
            break;
          default:
            top = rect.bottom + padding;
            left = rect.left;
        }
        
        // Keep tooltip in viewport
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
        top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));
        
        setPosition({ top, left });
        
        // Scroll target into view if needed
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(findTarget, 100);
    return () => clearTimeout(timer);
  }, [isActive, currentStepData, currentStep]);

  if (!isActive || !currentStepData) return null;

  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none">
      {/* Backdrop with spotlight */}
      <div className="absolute inset-0 bg-slate-950/70 pointer-events-auto" />
      
      {/* Highlight cutout */}
      {targetRect && (
        <div
          className="absolute border-2 border-primary-500 rounded-lg pointer-events-none shadow-lg shadow-primary-500/30"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.75)',
          }}
        />
      )}
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute w-80 pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-300"
        style={{ top: position.top, left: position.left }}
      >
        <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5 shadow-2xl">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <button
              onClick={completeTutorial}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Skip Tour
            </button>
          </div>
          
          {/* Content */}
          <h3 className="text-lg font-semibold text-white mb-2">
            {currentStepData.title}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-5">
            {currentStepData.content}
          </p>
          
          {/* Progress bar */}
          <div className="h-1 bg-slate-800 rounded-full mb-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={isFirstStep}
              className={cn(
                'px-4 py-2 text-sm rounded-lg transition-colors',
                isFirstStep 
                  ? 'text-slate-600 cursor-not-allowed' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              Back
            </button>
            <button
              onClick={isLastStep ? completeTutorial : nextStep}
              className="px-5 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
            >
              {isLastStep ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
        
        {/* Arrow pointer */}
        <div 
          className={cn(
            'absolute w-3 h-3 bg-slate-900 border-slate-700/50 rotate-45',
            currentStepData.placement === 'bottom' && '-top-1.5 left-1/2 -translate-x-1/2 border-t border-l',
            currentStepData.placement === 'top' && '-bottom-1.5 left-1/2 -translate-x-1/2 border-b border-r',
            currentStepData.placement === 'right' && '-left-1.5 top-8 border-l border-b',
            currentStepData.placement === 'left' && '-right-1.5 top-8 border-r border-t',
          )}
        />
      </div>
    </div>
  );
};

export default TutorialOverlay;
