import { cn } from '../utils/helpers';

const Card = ({
  children,
  title,
  subtitle,
  icon: Icon,
  action,
  variant = 'default',
  hover = false,
  padding = true,
  className,
  headerClassName,
  bodyClassName,
  ...props
}) => {
  const variants = {
    default: 'bg-surface-800/50 border-surface-700/50',
    glass: 'glass',
    gradient: 'bg-gradient-to-br from-surface-800 to-surface-900 border-surface-700/50',
    success: 'bg-success-500/10 border-success-500/30',
    warning: 'bg-warning-500/10 border-warning-500/30',
    danger: 'bg-danger-500/10 border-danger-500/30',
    info: 'bg-accent-500/10 border-accent-500/30',
  };

  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-300',
        variants[variant],
        hover && 'hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/10 hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div
          className={cn(
            'flex items-center justify-between',
            padding ? 'px-6 py-4' : 'px-4 py-3',
            'border-b border-surface-700/50',
            headerClassName
          )}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary-500/10">
                <Icon className="w-5 h-5 text-primary-400" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={cn(padding ? 'p-6' : '', bodyClassName)}>{children}</div>
    </div>
  );
};

// Stat Card variant for dashboard metrics
export const StatCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'primary',
  trend,
  className,
}) => {
  const iconColors = {
    primary: 'bg-primary-500/20 text-primary-400',
    success: 'bg-success-500/20 text-success-400',
    warning: 'bg-warning-500/20 text-warning-400',
    danger: 'bg-danger-500/20 text-danger-400',
    accent: 'bg-accent-500/20 text-accent-400',
  };

  const changeColors = {
    positive: 'text-success-400',
    negative: 'text-danger-400',
    neutral: 'text-gray-400',
  };

  return (
    <Card className={cn('group', className)} hover>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2 group-hover:text-gradient transition-all duration-300">
            {value}
          </p>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 mt-2 text-sm font-medium', changeColors[changeType])}>
              {trend === 'up' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.293-9.293a1 1 0 011.414 0L21 11" />
                </svg>
              )}
              {trend === 'down' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.293 9.293a1 1 0 01-1.414 0L3 13" />
                </svg>
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-xl transition-all duration-300 group-hover:scale-110', iconColors[iconColor])}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;
