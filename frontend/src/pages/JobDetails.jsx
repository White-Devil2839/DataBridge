import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import JSONViewer from '../components/JSONViewer';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime } from '../utils/formatters';
import { cn } from '../utils/helpers';


const Icons = {
  Back: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Sync: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
};

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();

  const fetchJob = useCallback(async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data.job);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch job');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  useEffect(() => {
    if (job && (job.status === 'PENDING' || job.status === 'RUNNING')) {
      const interval = setInterval(fetchJob, 3000);
      return () => clearInterval(interval);
    }
  }, [job?.status, fetchJob]);

  const handleRetry = async () => {
    try {
      setRetrying(true);
      await api.post(`/jobs/${id}/retry`);
      fetchJob();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to retry job');
    } finally {
      setRetrying(false);
    }
  };

  if (loading && !job) return <LoadingSpinner fullScreen />;

  if (!job && error) return <ErrorMessage message={error} />;
  if (!job) return <div className="text-center py-12 text-gray-400">Job not found</div>;

  const logs = Array.isArray(job.logs) ? job.logs : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          to="/jobs" 
          className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors group"
        >
          <Icons.Back className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Jobs</span>
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">Job Details</h1>
          <div className="flex items-center gap-3">
            <StatusBadge status={job.status} />
            {isAdmin() && job.status === 'FAILED' && (
              <Button 
                variant="primary" 
                size="sm" 
                icon={Icons.Sync} 
                onClick={handleRetry}
                loading={retrying}
              >
                Retry Job
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Information" className="lg:col-span-1">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Connector</p>
              <p className="text-sm font-medium text-white">{job.connector?.name}</p>
              <p className="text-xs text-gray-400 truncate">{job.connector?.baseUrl}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Timing</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-400">Started</p>
                  <p className="text-white">{job.startedAt ? new Date(job.startedAt).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Completed</p>
                  <p className="text-white">{job.completedAt ? new Date(job.completedAt).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Data Count</p>
              <div className="flex gap-4">
                <div className="px-3 py-1 rounded-full bg-surface-700/50 border border-surface-600/50 text-xs">
                  <span className="text-primary-400 font-bold mr-1">{job._count?.rawApiData || 0}</span>
                  <span className="text-gray-400">Raw</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-surface-700/50 border border-surface-600/50 text-xs">
                  <span className="text-success-400 font-bold mr-1">{job._count?.normalizedData || 0}</span>
                  <span className="text-gray-400">Normalized</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Logs" className="lg:col-span-2">
          <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-hide space-y-2">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border border-dashed border-surface-700 rounded-xl">
                No execution logs available
              </div>
            ) : (
              logs.map((log, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-lg bg-surface-900/50 border border-surface-800/50 font-mono text-[12px] flex items-start gap-3"
                >
                  <span className="text-gray-500 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={cn(
                    "font-bold shrink-0 w-16",
                    log.level === 'error' ? 'text-danger-400' :
                    log.level === 'warn' ? 'text-warning-400' : 'text-primary-400'
                  )}>
                    [{log.level?.toUpperCase()}]
                  </span>
                  <span className="text-gray-300 break-all">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {job.error && (
        <Card title="Terminal Error" className="border-danger-500/20">
          <div className="p-4 rounded-xl bg-danger-500/5 border border-danger-500/20 text-danger-400 font-mono text-sm">
            {job.error}
          </div>
        </Card>
      )}
    </div>
  );
};

export default JobDetails;
