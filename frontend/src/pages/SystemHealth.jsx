import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import { formatBytes } from '../utils/formatters';

const Icons = {
  Refresh: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Server: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  ),
  Database: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  Clock: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Chip: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  Activity: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

const SystemHealth = () => {
  const [health, setHealth] = useState(null);
  const [detailedHealth, setDetailedHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const [basicRes, statsRes] = await Promise.all([
        api.get('/health'),
        api.get('/health/stats'),
      ]);
      setHealth(basicRes.data);
      setDetailedHealth(statsRes.data);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    return parts.join(' ');
  };

  if (loading && !health) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">System Health</h1>
          <p className="text-gray-400 mt-1">Monitor backend performance and database status</p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button variant="secondary" icon={Icons.Refresh} onClick={fetchHealth} loading={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      {/* Status Banner */}
      {health && (
        <div className={`p-4 rounded-xl border ${health.status === 'ok' ? 'bg-success-500/10 border-success-500/30' : 'bg-danger-500/10 border-danger-500/30'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${health.status === 'ok' ? 'bg-success-500 animate-pulse' : 'bg-danger-500'}`} />
            <span className={`font-semibold ${health.status === 'ok' ? 'text-success-400' : 'text-danger-400'}`}>
              {health.status === 'ok' ? 'All Systems Operational' : 'System Issues Detected'}
            </span>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="p-2 rounded-xl bg-primary-500/10 w-fit mx-auto mb-3">
            <Icons.Clock className="w-6 h-6 text-primary-400" />
          </div>
          <p className="text-2xl font-bold text-white">{detailedHealth ? formatUptime(detailedHealth.uptime) : '--'}</p>
          <p className="text-xs text-gray-400 mt-1">UPTIME</p>
        </Card>
        
        <Card className="text-center">
          <div className="p-2 rounded-xl bg-accent-500/10 w-fit mx-auto mb-3">
            <Icons.Chip className="w-6 h-6 text-accent-400" />
          </div>
          <p className="text-2xl font-bold text-white">{detailedHealth ? formatBytes(detailedHealth.memoryUsage?.heapUsed || 0) : '--'}</p>
          <p className="text-xs text-gray-400 mt-1">MEMORY USED</p>
        </Card>
        
        <Card className="text-center">
          <div className="p-2 rounded-xl bg-success-500/10 w-fit mx-auto mb-3">
            <Icons.Database className="w-6 h-6 text-success-400" />
          </div>
          <p className="text-2xl font-bold text-white">{health?.services?.database?.status === 'healthy' ? 'Online' : 'Offline'}</p>
          <p className="text-xs text-gray-400 mt-1">DATABASE</p>
        </Card>
        
        <Card className="text-center">
          <div className="p-2 rounded-xl bg-warning-500/10 w-fit mx-auto mb-3">
            <Icons.Server className="w-6 h-6 text-warning-400" />
          </div>
          <p className="text-2xl font-bold text-white capitalize">{detailedHealth?.platform || '--'}</p>
          <p className="text-xs text-gray-400 mt-1">PLATFORM</p>
        </Card>
      </div>

      {/* Detailed Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Memory Details" subtitle="Node.js heap information">
          {detailedHealth?.memoryUsage ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Heap Used</span>
                <span className="text-sm font-medium text-white">{formatBytes(detailedHealth.memoryUsage.heapUsed)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Heap Total</span>
                <span className="text-sm font-medium text-white">{formatBytes(detailedHealth.memoryUsage.heapTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">External</span>
                <span className="text-sm font-medium text-white">{formatBytes(detailedHealth.memoryUsage.external)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">RSS (Total)</span>
                <span className="text-sm font-medium text-white">{formatBytes(detailedHealth.memoryUsage.rss)}</span>
              </div>
              
              {/* Memory usage bar */}
              <div className="mt-4 pt-4 border-t border-surface-700/50">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Heap Usage</span>
                  <span>{Math.round((detailedHealth.memoryUsage.heapUsed / detailedHealth.memoryUsage.heapTotal) * 100)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-700">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                    style={{ width: `${Math.round((detailedHealth.memoryUsage.heapUsed / detailedHealth.memoryUsage.heapTotal) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading...</p>
          )}
        </Card>

        <Card title="System Information" subtitle="Server environment details">
          {detailedHealth ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Node.js Version</span>
                <span className="text-sm font-medium text-white">{detailedHealth.nodeVersion}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Operating System</span>
                <span className="text-sm font-medium text-white capitalize">{detailedHealth.platform}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Architecture</span>
                <span className="text-sm font-medium text-white">{detailedHealth.arch}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Process ID</span>
                <span className="text-sm font-medium text-white font-mono">{detailedHealth.pid}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Environment</span>
                <span className="text-sm font-medium text-white capitalize">{detailedHealth.environment}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading...</p>
          )}
        </Card>
      </div>

      {/* What is System Health? */}
      <Card title="What is System Health?" subtitle="Understanding this dashboard">
        <div className="prose prose-invert max-w-none text-sm text-gray-300 space-y-3">
          <p>
            <strong className="text-white">System Health</strong> provides real-time monitoring of your DataBridge backend server. 
            It helps administrators ensure the application is running smoothly and identify potential issues before they affect users.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-3 rounded-lg bg-surface-800/50 border border-surface-700/50">
              <h4 className="text-white font-medium flex items-center gap-2 mb-1">
                <Icons.Clock className="w-4 h-4 text-primary-400" /> Uptime
              </h4>
              <p className="text-xs">How long the server has been running without restart. Longer uptime = stable service.</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-800/50 border border-surface-700/50">
              <h4 className="text-white font-medium flex items-center gap-2 mb-1">
                <Icons.Chip className="w-4 h-4 text-accent-400" /> Memory Usage
              </h4>
              <p className="text-xs">RAM consumed by the Node.js process. High usage may indicate memory leaks.</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-800/50 border border-surface-700/50">
              <h4 className="text-white font-medium flex items-center gap-2 mb-1">
                <Icons.Database className="w-4 h-4 text-success-400" /> Database Status
              </h4>
              <p className="text-xs">Confirms the backend can communicate with your MySQL database.</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-800/50 border border-surface-700/50">
              <h4 className="text-white font-medium flex items-center gap-2 mb-1">
                <Icons.Server className="w-4 h-4 text-warning-400" /> Platform
              </h4>
              <p className="text-xs">The operating system running the server (darwin = macOS, linux, win32 = Windows).</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SystemHealth;
