import { useTutorial } from '../context/TutorialContext';
import Button from './Button';

const TutorialWelcome = () => {
  const { showWelcome, startTutorial, skipTutorial } = useTutorial();

  if (!showWelcome) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={skipTutorial}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <span className="text-2xl">👋</span>
          </div>
          
          {/* Content */}
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            Welcome to DataBridge
          </h2>
          <p className="text-slate-400 text-center text-sm leading-relaxed mb-8">
            Would you like a quick walkthrough to understand how DataBridge works?
            <br />
            <span className="text-slate-500">It takes about 60–90 seconds.</span>
          </p>
          
          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={startTutorial}
              className="w-full"
              size="lg"
            >
              Start Tour
            </Button>
            <button
              onClick={skipTutorial}
              className="w-full py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialWelcome;
