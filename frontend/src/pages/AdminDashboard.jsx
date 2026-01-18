import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import api from '../services/api';
import Card, { StatCard } from '../components/Card';
import LoadingSpinner, { CardSkeleton } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { formatRelativeTime, formatBytes } from '../utils/formatters';
import { cn } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import DataHealth from '../components/DataHealth';

// Icons
const Icons = {
  Connector: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Jobs: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Active: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Success: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Plus: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  ArrowRight: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [connectorsRes, jobsRes, healthRes] = await Promise.all([
        api.get('/connectors?limit=100'),
        api.get('/jobs?limit=10'),
        isAdmin() ? api.get('/health/stats') : Promise.resolve({ data: null }),
      ]);

      const jobs = jobsRes.data.jobs || [];
      const successJobs = jobs.filter((j) => j.status === 'SUCCESS').length;
      const failedJobs = jobs.filter((j) => j.status === 'FAILED').length;
      const runningJobs = jobs.filter((j) => j.status === 'RUNNING').length;

      setStats({
        connectors: connectorsRes.data.pagination?.total || 0,
        totalJobs: jobsRes.data.pagination?.total || 0,
        successJobs,
        failedJobs,
        runningJobs,
      });

      setRecentJobs(jobs.slice(0, 5));
      if (healthRes.data) {
        setHealth(healthRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Mock chart data for visualization
  const chartData = [
    { name: 'Mon', syncs: 12, records: 450 },
    { name: 'Tue', syncs: 19, records: 890 },
    { name: 'Wed', syncs: 15, records: 650 },
    { name: 'Thu', syncs: 25, records: 1200 },
    { name: 'Fri', syncs: 22, records: 980 },
    { name: 'Sat', syncs: 8, records: 340 },
    { name: 'Sun', syncs: 14, records: 720 },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-surface-700 rounded animate-pulse" />
            <div className="h-4 w-64 bg-surface-700 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div data-tutorial="dashboard">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Monitor your API connectors and sync jobs
          </p>
        </div>
        {isAdmin() && (
          <Link to="/connectors/new">
            <Button icon={Icons.Plus}>
              New Connector
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Connectors"
          value={stats?.connectors || 0}
          icon={Icons.Connector}
          iconColor="primary"
        />
        <StatCard
          title="Total Jobs"
          value={stats?.totalJobs || 0}
          icon={Icons.Jobs}
          iconColor="accent"
        />
        <StatCard
          title="Running Jobs"
          value={stats?.runningJobs || 0}
          icon={Icons.Active}
          iconColor="warning"
        />
        <StatCard
          title="Success Rate"
          value={stats?.totalJobs ? `${Math.round((stats.successJobs / stats.totalJobs) * 100)}%` : 'N/A'}
          icon={Icons.Success}
          iconColor="success"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Sync Activity" subtitle="Last 7 days">
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSyncs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="syncs"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSyncs)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Records Synced" subtitle="Last 7 days">
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="records"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ fill: '#06b6d4', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#06b6d4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Jobs & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <Card
          title="Recent Sync Jobs"
          subtitle="Latest activity"
          className="lg:col-span-2"
          action={
            <Link to="/jobs">
              <Button variant="ghost" size="sm" icon={Icons.ArrowRight} iconPosition="right">
                View All
              </Button>
            </Link>
          }
        >
          {recentJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Icons.Jobs className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No sync jobs yet</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-700/50">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="flex items-center justify-between py-3 hover:bg-surface-700/20 -mx-6 px-6 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        job.status === 'SUCCESS' && 'bg-success-500/20 text-success-400',
                        job.status === 'FAILED' && 'bg-danger-500/20 text-danger-400',
                        job.status === 'RUNNING' && 'bg-accent-500/20 text-accent-400',
                        job.status === 'PENDING' && 'bg-warning-500/20 text-warning-400'
                      )}
                    >
                      <Icons.Jobs className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {job.connector?.name || 'Unknown Connector'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatRelativeTime(job.createdAt)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={job.status} size="sm" />
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions & System Health */}
        <div className="space-y-6">
          {isAdmin() && (
            <Card title="Quick Actions" subtitle="Common tasks">
              <div className="space-y-3">
                <Link to="/connectors/new" className="block">
                  <div className="p-4 rounded-xl bg-surface-700/30 border border-surface-600/50 hover:border-primary-500/30 hover:bg-surface-700/50 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400 group-hover:scale-110 transition-transform">
                        <Icons.Plus className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Create Connector</p>
                        <p className="text-xs text-gray-400">Add a new API source</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link to="/connectors" className="block">
                  <div className="p-4 rounded-xl bg-surface-700/30 border border-surface-600/50 hover:border-primary-500/30 hover:bg-surface-700/50 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent-500/20 text-accent-400 group-hover:scale-110 transition-transform">
                        <Icons.Connector className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Manage Connectors</p>
                        <p className="text-xs text-gray-400">View and edit sources</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link to="/data/normalized" className="block">
                  <div className="p-4 rounded-xl bg-surface-700/30 border border-surface-600/50 hover:border-primary-500/30 hover:bg-surface-700/50 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-success-500/20 text-success-400 group-hover:scale-110 transition-transform">
                        <Icons.Success className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">View Data</p>
                        <p className="text-xs text-gray-400">Browse normalized data</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </Card>
          )}

          {!isAdmin() && (
            <DataHealth />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
