import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const TutorialContext = createContext(null);

const TUTORIAL_STORAGE_KEY = 'databridge_tutorial_completed';
const TUTORIAL_SKIPPED_KEY = 'databridge_tutorial_skipped';

// Tutorial steps configuration
const baseTutorialSteps = [
  {
    id: 'dashboard',
    target: '[data-tutorial="dashboard"]',
    title: 'Dashboard Overview',
    content: 'This is your Dashboard. It gives you a quick overview of your connectors, sync activity, and data freshness.',
    placement: 'bottom',
  },
  {
    id: 'connectors-nav',
    target: '[data-tutorial="connectors-nav"]',
    title: 'Connectors',
    content: 'Connectors define which external APIs DataBridge pulls data from. You can create your own personal connectors or use shared ones.',
    placement: 'right',
  },
  {
    id: 'jobs-nav',
    target: '[data-tutorial="jobs-nav"]',
    title: 'Sync Jobs',
    content: 'Every time data is fetched, a Sync Job is created. This lets you track success, failures, retries, and execution history.',
    placement: 'right',
  },
  {
    id: 'normalized-nav',
    target: '[data-tutorial="normalized-nav"]',
    title: 'Normalized Data',
    content: 'This is the final, cleaned data ready for use in dashboards, exports, or analytics tools.',
    placement: 'right',
  },
];

const adminOnlySteps = [
  {
    id: 'raw-data-nav',
    target: '[data-tutorial="raw-data-nav"]',
    title: 'Raw Data',
    content: 'As an admin, you can inspect the raw API responses before normalization for debugging and validation.',
    placement: 'right',
  },
  {
    id: 'system-health-nav',
    target: '[data-tutorial="system-health-nav"]',
    title: 'System Health',
    content: 'Monitor backend infrastructure, database connectivity, and overall system performance.',
    placement: 'right',
  },
];

export const TutorialProvider = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);

  // Check if tutorial should be shown on mount
  useEffect(() => {
    if (!user) return;

    const completed = localStorage.getItem(`${TUTORIAL_STORAGE_KEY}_${user.id}`);
    const skipped = localStorage.getItem(`${TUTORIAL_SKIPPED_KEY}_${user.id}`);

    // Show welcome modal only if not completed and not skipped
    if (!completed && !skipped) {
      // Small delay to let the dashboard render first
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Build steps based on role
  useEffect(() => {
    if (isAdmin && isAdmin()) {
      setSteps([...baseTutorialSteps, ...adminOnlySteps]);
    } else {
      setSteps(baseTutorialSteps);
    }
  }, [isAdmin]);

  const startTutorial = useCallback(() => {
    setShowWelcome(false);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const skipTutorial = useCallback(() => {
    if (user) {
      localStorage.setItem(`${TUTORIAL_SKIPPED_KEY}_${user.id}`, 'true');
    }
    setShowWelcome(false);
    setIsActive(false);
  }, [user]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeTutorial();
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const completeTutorial = useCallback(() => {
    if (user) {
      localStorage.setItem(`${TUTORIAL_STORAGE_KEY}_${user.id}`, 'true');
    }
    setIsActive(false);
    setCurrentStep(0);
  }, [user]);

  const resetTutorial = useCallback(() => {
    if (user) {
      localStorage.removeItem(`${TUTORIAL_STORAGE_KEY}_${user.id}`);
      localStorage.removeItem(`${TUTORIAL_SKIPPED_KEY}_${user.id}`);
    }
    setShowWelcome(true);
  }, [user]);

  const value = {
    showWelcome,
    isActive,
    currentStep,
    steps,
    currentStepData: steps[currentStep] || null,
    startTutorial,
    skipTutorial,
    nextStep,
    prevStep,
    completeTutorial,
    resetTutorial,
    totalSteps: steps.length,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

export default TutorialContext;
