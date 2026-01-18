import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner, { CardSkeleton } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Badge } from '../components/StatusBadge';
import { formatRelativeTime } from '../utils/formatters';
import { AUTH_TYPE_LABELS } from '../utils/constants';
import { cn } from '../utils/helpers';

// Icons
const Icons = {
  Plus: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Sync: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Edit: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Delete: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  API: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Shared: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
};

const ConnectorList = () => {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState({});
  const [error, setError] = useState('');
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConnectors();
  }, []);

  const fetchConnectors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/connectors');
      setConnectors(response.data.connectors || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch connectors');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setSyncing((prev) => ({ ...prev, [id]: true }));
      await api.post(`/connectors/${id}/sync`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to trigger sync');
    } finally {
      setSyncing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this connector?')) return;
    
    try {
      await api.delete(`/connectors/${id}`);
      setConnectors((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete connector');
    }
  };

  // Helper to check if current user can manage (edit/delete) this connector
  const canManage = (connector) => {
    return isAdmin() || connector.userId === user?.id;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-40 bg-surface-700 rounded animate-pulse" />
            <div className="h-4 w-56 bg-surface-700 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Connectors</h1>
          <p className="text-gray-400 mt-1">
            Manage your API data sources
          </p>
        </div>
        <Link to="/connectors/new">
          <Button icon={Icons.Plus}>
            New Connector
          </Button>
        </Link>
      </div>

      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={() => setError('')}
          onRetry={fetchConnectors}
        />
      )}

      {/* Connectors Grid */}
      {connectors.length === 0 ? (
        <Card className="text-center py-12">
          <Icons.API className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No connectors yet</h3>
          <p className="text-gray-400 mb-6">
            Create your first API connector to start syncing data
          </p>
          <Link to="/connectors/new">
            <Button icon={Icons.Plus}>Create Connector</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connectors.map((connector) => (
            <div
              key={connector.id}
              onClick={() => navigate(`/connectors/${connector.id}`)}
              className="block group cursor-pointer"
            >
              <Card hover className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors">
                    <Icons.API className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    {connector.isShared && (
                      <Badge variant="accent" className="flex items-center gap-1">
                        <Icons.Shared className="w-3 h-3" />
                        Shared
                      </Badge>
                    )}
                    <Badge variant="primary">
                      {AUTH_TYPE_LABELS[connector.authType] || connector.authType}
                    </Badge>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">
                  {connector.name}
                </h3>
                
                <p className="text-sm text-gray-400 truncate mb-4">
                  {connector.baseUrl}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-surface-700/50">
                  <p className="text-xs text-gray-500">
                    Created {formatRelativeTime(connector.createdAt)}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    {/* Sync button - available to anyone who can see it */}
                    <button
                      onClick={(e) => handleSync(connector.id, e)}
                      disabled={syncing[connector.id]}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        syncing[connector.id]
                          ? 'text-gray-500 cursor-not-allowed'
                          : 'text-gray-400 hover:text-accent-400 hover:bg-accent-500/10'
                      )}
                      title="Sync now"
                    >
                      <Icons.Sync className={cn('w-4 h-4', syncing[connector.id] && 'animate-spin')} />
                    </button>
                    
                    {/* Edit/Delete - only for owners or admins */}
                    {canManage(connector) && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/connectors/${connector.id}/edit`);
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                          title="Edit"
                        >
                          <Icons.Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(connector.id, e)}
                          className="p-2 rounded-lg text-gray-400 hover:text-danger-400 hover:bg-danger-500/10 transition-colors"
                          title="Delete"
                        >
                          <Icons.Delete className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectorList;
