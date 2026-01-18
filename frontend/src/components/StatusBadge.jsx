import { cn } from '../utils/helpers';
import { JOB_STATUS } from '../utils/constants';

const StatusBadge = ({ status, size = 'md', showDot = true, className }) => {
  const statusConfig = {
    [JOB_STATUS.PENDING]: {
      bg: 'bg-warning-500/20',
      text: 'text-warning-400',
      border: 'border-warning-500/30',
      dot: 'bg-warning-500',
      label: 'Pending',
    },
    [JOB_STATUS.RUNNING]: {
      bg: 'bg-accent-500/20',
      text: 'text-accent-400',
      border: 'border-accent-500/30',
      dot: 'bg-accent-500',
      label: 'Running',
      animate: true,
    },
    [JOB_STATUS.SUCCESS]: {
      bg: 'bg-success-500/20',
      text: 'text-success-400',
      border: 'border-success-500/30',
      dot: 'bg-success-500',
      label: 'Success',
    },
    [JOB_STATUS.FAILED]: {
      bg: 'bg-danger-500/20',
      text: 'text-danger-400',
      border: 'border-danger-500/30',
      dot: 'bg-danger-500',
      label: 'Failed',
    },
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const config = statusConfig[status] || statusConfig[JOB_STATUS.PENDING];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        config.bg,
        config.text,
        config.border,
        sizes[size],
        className
      )}
    >
      {showDot && (
        <span className="relative flex">
          <span
            className={cn(
              'rounded-full',
              config.dot,
              dotSizes[size],
              config.animate && 'animate-ping absolute inline-flex h-full w-full opacity-75'
            )}
          />
          <span className={cn('relative rounded-full', config.dot, dotSizes[size])} />
        </span>
      )}
      {config.label}
    </span>
  );
};

// Generic badge component
export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  className,
}) => {
  const variants = {
    neutral: 'bg-surface-600/50 text-gray-300 border-surface-500',
    primary: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
    success: 'bg-success-500/20 text-success-400 border-success-500/30',
    warning: 'bg-warning-500/20 text-warning-400 border-warning-500/30',
    danger: 'bg-danger-500/20 text-danger-400 border-danger-500/30',
    info: 'bg-accent-500/20 text-accent-400 border-accent-500/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default StatusBadge;
