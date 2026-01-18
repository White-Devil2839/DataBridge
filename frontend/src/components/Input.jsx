import { forwardRef } from 'react';
import { cn } from '../utils/helpers';

const Input = forwardRef(({
  label,
  error,
  hint,
  icon: Icon,
  iconPosition = 'left',
  type = 'text',
  className,
  inputClassName,
  labelClassName,
  required,
  ...props
}, ref) => {
  const hasIcon = Boolean(Icon);

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className={cn('block text-sm font-medium text-gray-300 mb-2', labelClassName)}>
          {label}
          {required && <span className="text-danger-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {hasIcon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-gray-500" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg',
            'bg-surface-800 text-gray-100',
            'border transition-all duration-200',
            error
              ? 'border-danger-500 focus:border-danger-500 focus:ring-1 focus:ring-danger-500'
              : 'border-surface-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
            'placeholder-gray-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            hasIcon && iconPosition === 'left' && 'pl-10',
            hasIcon && iconPosition === 'right' && 'pr-10',
            inputClassName
          )}
          {...props}
        />
        {hasIcon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-gray-500" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-danger-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea variant
export const Textarea = forwardRef(({
  label,
  error,
  hint,
  className,
  textareaClassName,
  rows = 4,
  required,
  ...props
}, ref) => {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
          {required && <span className="text-danger-400 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg resize-y',
          'bg-surface-800 text-gray-100',
          'border transition-all duration-200',
          error
            ? 'border-danger-500 focus:border-danger-500 focus:ring-1 focus:ring-danger-500'
            : 'border-surface-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
          'placeholder-gray-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          textareaClassName
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-danger-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Select variant
export const Select = forwardRef(({
  label,
  error,
  hint,
  options = [],
  placeholder = 'Select an option',
  className,
  selectClassName,
  required,
  ...props
}, ref) => {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
          {required && <span className="text-danger-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg appearance-none cursor-pointer',
            'bg-surface-800 text-gray-100',
            'border transition-all duration-200',
            error
              ? 'border-danger-500 focus:border-danger-500 focus:ring-1 focus:ring-danger-500'
              : 'border-surface-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'pr-10',
            selectClassName
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-danger-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Input;
