import { cn } from '../utils/helpers';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false, // Alias for isLoading
  showLoading: showLoadingProp = false, // Also support showLoading prop
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className,
  ...props
}) => {
  // Support isLoading, loading, and showLoading props
  const showLoading = isLoading || loading || showLoadingProp;

  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-900 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 focus:ring-primary-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40',
    secondary: 'bg-surface-700 text-gray-200 border border-surface-600 hover:bg-surface-600 hover:border-surface-500 focus:ring-surface-500',
    danger: 'bg-danger-600 text-white hover:bg-danger-500 focus:ring-danger-500 shadow-lg shadow-danger-500/25',
    success: 'bg-success-600 text-white hover:bg-success-500 focus:ring-success-500 shadow-lg shadow-success-500/25',
    ghost: 'bg-transparent text-gray-300 hover:bg-surface-700 hover:text-white focus:ring-surface-500',
    outline: 'bg-transparent border-2 border-primary-500 text-primary-400 hover:bg-primary-500/10 focus:ring-primary-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
    icon: 'p-2',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
    icon: 'w-5 h-5',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        showLoading && 'relative text-transparent hover:text-transparent',
        className
      )}
      disabled={disabled || showLoading}
      {...props}
    >
      {showLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className={cn('animate-spin', iconSizes[size], 'text-current')}
            style={{ color: variant === 'primary' || variant === 'danger' || variant === 'success' ? 'white' : 'currentColor' }}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}
      {Icon && iconPosition === 'left' && !showLoading && (
        <Icon className={iconSizes[size]} />
      )}
      {children}
      {Icon && iconPosition === 'right' && !showLoading && (
        <Icon className={iconSizes[size]} />
      )}
    </button>
  );
};

export default Button;

