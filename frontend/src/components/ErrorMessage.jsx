import { cn } from '../utils/helpers';

const ErrorMessage = ({
  message,
  title = 'Error',
  variant = 'error',
  onRetry,
  onDismiss,
  className,
}) => {
  const variants = {
    error: {
      bg: 'bg-danger-500/10',
      border: 'border-danger-500/30',
      icon: 'text-danger-400',
      title: 'text-danger-400',
      message: 'text-danger-300',
    },
    warning: {
      bg: 'bg-warning-500/10',
      border: 'border-warning-500/30',
      icon: 'text-warning-400',
      title: 'text-warning-400',
      message: 'text-warning-300',
    },
    info: {
      bg: 'bg-accent-500/10',
      border: 'border-accent-500/30',
      icon: 'text-accent-400',
      title: 'text-accent-400',
      message: 'text-accent-300',
    },
    success: {
      bg: 'bg-success-500/10',
      border: 'border-success-500/30',
      icon: 'text-success-400',
      title: 'text-success-400',
      message: 'text-success-300',
    },
  };

  const icons = {
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const config = variants[variant];

  if (!message) return null;

  return (
    <div
      className={cn(
        'rounded-lg border p-4 animate-slide-up',
        config.bg,
        config.border,
        className
      )}
      role="alert"
    >
      <div className="flex gap-3">
        <div className={cn('flex-shrink-0', config.icon)}>
          {icons[variant]}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn('text-sm font-medium', config.title)}>
            {title}
          </h4>
          <p className={cn('text-sm mt-1', config.message)}>
            {message}
          </p>
          {(onRetry || onDismiss) && (
            <div className="flex gap-3 mt-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={cn(
                    'text-sm font-medium hover:underline',
                    config.title
                  )}
                >
                  Try again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm font-medium text-gray-400 hover:text-gray-300"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cn('flex-shrink-0 hover:opacity-80', config.icon)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Toast notification component
export const Toast = ({
  message,
  variant = 'info',
  onClose,
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <ErrorMessage
        message={message}
        variant={variant}
        title={variant.charAt(0).toUpperCase() + variant.slice(1)}
        onDismiss={onClose}
        className="shadow-lg"
      />
    </div>
  );
};

export default ErrorMessage;
