import { useState } from 'react';
import { cn } from '../utils/helpers';
import { copyToClipboard } from '../utils/helpers';

const JSONViewer = ({
  data,
  collapsed = false,
  maxHeight = '400px',
  className,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!collapsed);

  const handleCopy = async () => {
    const success = await copyToClipboard(JSON.stringify(data, null, 2));
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const formatJSON = (obj, indent = 0) => {
    if (obj === null) return <span className="text-warning-400">null</span>;
    if (obj === undefined) return <span className="text-gray-500">undefined</span>;

    const type = typeof obj;

    if (type === 'boolean') {
      return <span className="text-accent-400">{obj.toString()}</span>;
    }

    if (type === 'number') {
      return <span className="text-success-400">{obj}</span>;
    }

    if (type === 'string') {
      // Check if it's a URL
      if (obj.startsWith('http://') || obj.startsWith('https://')) {
        return (
          <a
            href={obj}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:underline"
          >
            "{obj}"
          </a>
        );
      }
      return <span className="text-warning-300">"{obj}"</span>;
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return <span className="text-gray-400">[]</span>;

      return (
        <span>
          <span className="text-gray-400">[</span>
          <div style={{ marginLeft: `${(indent + 1) * 16}px` }}>
            {obj.map((item, i) => (
              <div key={i}>
                {formatJSON(item, indent + 1)}
                {i < obj.length - 1 && <span className="text-gray-400">,</span>}
              </div>
            ))}
          </div>
          <span className="text-gray-400">]</span>
        </span>
      );
    }

    if (type === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) return <span className="text-gray-400">{'{}'}</span>;

      return (
        <span>
          <span className="text-gray-400">{'{'}</span>
          <div style={{ marginLeft: `${(indent + 1) * 16}px` }}>
            {keys.map((key, i) => (
              <div key={key}>
                <span className="text-primary-300">"{key}"</span>
                <span className="text-gray-400">: </span>
                {formatJSON(obj[key], indent + 1)}
                {i < keys.length - 1 && <span className="text-gray-400">,</span>}
              </div>
            ))}
          </div>
          <span className="text-gray-400">{'}'}</span>
        </span>
      );
    }

    return <span className="text-gray-300">{String(obj)}</span>;
  };

  return (
    <div className={cn('rounded-xl border border-surface-700/50 overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-800/50 border-b border-surface-700/50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-surface-700/50 text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-90')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <span className="text-xs font-medium text-gray-400 uppercase">JSON</span>
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            'text-xs px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5',
            isCopied
              ? 'bg-success-500/20 text-success-400'
              : 'bg-surface-700 text-gray-400 hover:text-white'
          )}
        >
          {isCopied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div
          className="p-4 bg-surface-900/50 overflow-auto font-mono text-sm"
          style={{ maxHeight }}
        >
          {formatJSON(data)}
        </div>
      )}
    </div>
  );
};

export default JSONViewer;
