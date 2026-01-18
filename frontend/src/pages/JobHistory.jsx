import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useSyncJobs from '../hooks/useSyncJobs';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { formatRelativeTime } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

const Icons = {
  Sync: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Eye: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
};

const JobHistory = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { jobs, loading, error, pagination, refetch } = useSyncJobs(page, 10, { status: statusFilter || undefined });
  const { isAdmin } = useAuth();
  const [retrying, setRetrying] = useState({});

  const handleRetry = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setRetrying(prev => ({ ...prev, [id]: true }));
      await api.post(`/jobs/${id}/retry`);
      refetch();
    } catch (err) {
      // Local error handling if needed, but useSyncJobs handles global error
    } finally {
      setRetrying(prev => ({ ...prev, [id]: false }));
    }
  };

  const columns = [
    {
      header: 'Connector',
      accessor: (job) => (
        <div className="flex flex-col">
          <span className="font-medium text-white">{job.connector?.name || 'Unknown'}</span>
          <span className="text-xs text-gray-400 truncate max-w-[200px]">{job.connector?.baseUrl}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (job) => <StatusBadge status={job.status} size="sm" />,
    },
    {
      header: 'Started',
      accessor: (job) => (
        <span className="text-gray-400 text-sm">
          {job.startedAt ? formatRelativeTime(job.startedAt) : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Data',
      accessor: (job) => (
        <div className="flex gap-2">
          <span className="text-xs text-primary-400 font-medium">
            {job._count?.rawApiData || 0} Raw
          </span>
          <span className="text-xs text-success-400 font-medium">
            {job._count?.normalizedData || 0} Norm
          </span>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (job) => (
        <div className="flex items-center gap-2">
          <Link to={`/jobs/${job.id}`}>
            <Button variant="ghost" size="sm" icon={Icons.Eye} title="View Details" />
          </Link>
          {isAdmin() && job.status === 'FAILED' && (
            <Button 
              variant="ghost" 
              size="sm" 
              icon={Icons.Sync} 
              onClick={(e) => handleRetry(job.id, e)}
              loading={retrying[job.id]}
              title="Retry Job"
              className="text-primary-400 hover:text-primary-300 hover:bg-primary-500/10"
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Sync Jobs</h1>
          <p className="text-gray-400 mt-1">History of all data synchronization runs</p>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 rounded-xl bg-surface-800 border border-surface-700 text-white text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="RUNNING">Running</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {error && <ErrorMessage message={error} />}

      <DataTable
        columns={columns}
        data={jobs}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        emptyMessage="No sync jobs found."
      />
    </div>
  );
};

export default JobHistory;
