import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import JSONViewer from '../components/JSONViewer';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/StatusBadge';
import { AUTH_TYPE_LABELS } from '../utils/constants';

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
};

const ConnectorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [connector, setConnector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchConnector();
  }, [id]);

  const fetchConnector = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/connectors/${id}`);
      setConnector(response.data.connector);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch connector');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await api.post(`/connectors/${id}/sync`);
      navigate(`/jobs/${response.data.syncJob.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to trigger sync');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this connector?')) {
      return;
    }

    try {
      await api.delete(`/connectors/${id}`);
      navigate('/connectors');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete connector');
    }
  };

  if (loading && !connector) return <LoadingSpinner fullScreen />;

  if (!connector && error) return <ErrorMessage message={error} onRetry={fetchConnector} />;
  if (!connector) return <div className="text-center py-12 text-gray-400">Connector not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          to="/connectors" 
          className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors group"
        >
          <Icons.Back className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Connectors</span>
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{connector.name}</h1>
            <p className="text-gray-400 text-sm mt-1 truncate max-w-xl">{connector.baseUrl}</p>
          </div>
          
          {isAdmin() && (
            <div className="flex items-center gap-2">
              <Link to={`/connectors/${id}/edit`}>
                <Button variant="ghost" icon={Icons.Edit}>Edit</Button>
              </Link>
              <Button 
                variant="primary" 
                icon={Icons.Sync} 
                onClick={handleSync} 
                loading={syncing}
              >
                Sync Now
              </Button>
              <Button 
                variant="ghost" 
                icon={Icons.Delete} 
                onClick={handleDelete}
                className="text-danger-400 hover:text-danger-300 hover:bg-danger-500/10"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card title="Connector Info">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Auth Type</p>
                <Badge variant="primary">{AUTH_TYPE_LABELS[connector.authType] || connector.authType}</Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Created</p>
                <p className="text-sm text-white">{new Date(connector.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Owner</p>
                <p className="text-sm text-white">{connector.user?.email || 'N/A'}</p>
              </div>
            </div>
          </Card>

          <Card title="Rate Limits">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Sync Schedule</span>
                <span className="text-sm font-medium text-white">{connector.rateLimitConfig?.syncSchedule || 'Manual only'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Request Delay</span>
                <span className="text-sm font-medium text-white">{connector.rateLimitConfig?.delayBetweenRequests || 0}ms</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card title="Configurations" subtitle="Technical mapping and endpoints">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-white mb-2 ml-1">Endpoint Configuration</h4>
                <div className="rounded-xl bg-surface-900/50 border border-surface-700/50 overflow-hidden">
                  <JSONViewer data={connector.endpointConfig} collapsed={1} />
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-white mb-2 ml-1">Field Mapping</h4>
                <div className="rounded-xl bg-surface-900/50 border border-surface-700/50 overflow-hidden">
                  <JSONViewer data={connector.fieldMappingConfig} collapsed={1} />
                </div>
              </div>

              {isAdmin() && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2 ml-1">Auth Configuration</h4>
                  <div className="rounded-xl bg-surface-900/50 border border-surface-700/50 overflow-hidden">
                    <JSONViewer data={connector.authConfig} collapsed={true} />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConnectorDetails;
