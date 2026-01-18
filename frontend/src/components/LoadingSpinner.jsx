import { cn } from '../utils/helpers';

const LoadingSpinner = ({ 
  size = 'md', 
  className,
  text,
  fullScreen = false,
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className="relative">
        <div
          className={cn(
            'rounded-full border-2 border-surface-700',
            sizes[size]
          )}
        />
        <div
          className={cn(
            'absolute top-0 left-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin',
            sizes[size]
          )}
        />
      </div>
      {text && (
        <p className="text-sm text-gray-400 animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-surface-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Skeleton loading component
export const Skeleton = ({
  variant = 'text',
  width,
  height,
  className,
  count = 1,
}) => {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-6 rounded',
    avatar: 'rounded-full',
    card: 'rounded-xl',
    button: 'h-10 rounded-lg',
  };

  const elements = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={cn(
        'bg-surface-700 animate-pulse',
        variants[variant],
        className
      )}
      style={{
        width: width || (variant === 'avatar' ? '40px' : '100%'),
        height: height || (variant === 'avatar' ? '40px' : undefined),
      }}
    />
  ));

  return count === 1 ? elements[0] : <div className="space-y-2">{elements}</div>;
};

// Card skeleton
export const CardSkeleton = ({ className }) => (
  <div className={cn('bg-surface-800/50 rounded-xl border border-surface-700/50 p-6', className)}>
    <div className="flex items-center gap-3 mb-4">
      <Skeleton variant="avatar" width="40px" height="40px" />
      <div className="flex-1">
        <Skeleton variant="title" width="60%" />
        <Skeleton variant="text" width="40%" className="mt-2" />
      </div>
    </div>
    <Skeleton count={3} className="mt-2" />
  </div>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4, className }) => (
  <div className={cn('overflow-hidden rounded-xl border border-surface-700/50', className)}>
    <div className="bg-surface-800/50 px-4 py-3 border-b border-surface-700">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" width={`${100 / columns}%`} />
        ))}
      </div>
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="px-4 py-3 border-b border-surface-700/50 last:border-0">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width={`${100 / columns}%`} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default LoadingSpinner;
