import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';

const ConnectorForm = ({ connectorId }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(!!connectorId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    authType: 'NONE',
    authConfig: {},
    rateLimitConfig: {
      requestsPerMinute: 60,
      syncSchedule: '1h'
    },
    endpointConfig: [],
    fieldMappingConfig: {
      mappings: []
    },
    isShared: false,
  });
  const [jsonErrors, setJsonErrors] = useState({});

  useEffect(() => {
    if (connectorId) {
      fetchConnector();
    }
  }, [connectorId]);

  const fetchConnector = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/connectors/${connectorId}`);
      setFormData(response.data.connector);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch connector');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleJsonChange = (field, value) => {
    try {
      if (!value || value.trim() === '') {
        setFormData((prev) => ({ ...prev, [field]: field === 'endpointConfig' ? [] : {} }));
        setJsonErrors((prev) => ({ ...prev, [field]: null }));
        return;
      }
      const parsed = JSON.parse(value);
      setFormData((prev) => ({ ...prev, [field]: parsed }));
      setJsonErrors((prev) => ({ ...prev, [field]: null }));
    } catch (err) {
      setJsonErrors((prev) => ({ ...prev, [field]: 'Invalid JSON format' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const hasJsonErrors = Object.values(jsonErrors).some((err) => err !== null);
    if (hasJsonErrors) {
      setError('Please fix all JSON configuration errors before submitting.');
      return;
    }

    try {
      setSaving(true);
      if (connectorId) {
        await api.put(`/connectors/${connectorId}`, formData);
      } else {
        await api.post('/connectors', formData);
      }
      navigate('/connectors');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save connector');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {connectorId ? 'Edit Connector' : 'New Connector'}
          </h1>
          <p className="text-slate-400 mt-2">
            Configure how DataBridge connects to your API source.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
        {error && <ErrorMessage message={error} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-6">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Connector Name"
                placeholder="e.g. My Finnhub Source"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
              <Input
                label="Base API URL"
                type="url"
                placeholder="https://api.example.com/v1"
                value={formData.baseUrl}
                onChange={(e) => handleChange('baseUrl', e.target.value)}
                required
              />
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Auth Mechanism</label>
                <select
                  value={formData.authType}
                  onChange={(e) => handleChange('authType', e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none"
                >
                  <option value="NONE">No Authentication</option>
                  <option value="API_KEY">API Key (Header or Query)</option>
                  <option value="BEARER">Bearer Token</option>
                </select>
              </div>

              {isAdmin() && (
                <div className="flex items-center space-x-3 h-full pt-8">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.isShared}
                      onChange={(e) => handleChange('isShared', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <span className="text-sm font-medium text-slate-300">Share with all users</span>
                </div>
              )}
            </div>
          </Card>

          <Card title="Authentication (JSON)">
            <p className="text-xs text-slate-500 mb-4">Define headers or tokens required for requests.</p>
            <textarea
              className={`w-full h-40 bg-slate-900 border ${jsonErrors.authConfig ? 'border-danger-500' : 'border-slate-800'} rounded-xl p-4 font-mono text-sm text-primary-300 outline-none focus:ring-1 focus:ring-primary-500 transition-all`}
              value={JSON.stringify(formData.authConfig, null, 2)}
              onChange={(e) => handleJsonChange('authConfig', e.target.value)}
            />
            {jsonErrors.authConfig && <p className="text-xs text-danger-400 mt-2">{jsonErrors.authConfig}</p>}
          </Card>

          <Card title="Traffic Control">
            <p className="text-xs text-slate-500 mb-4">Configure rate limits and sync intervals.</p>
            <textarea
              className={`w-full h-40 bg-slate-900 border ${jsonErrors.rateLimitConfig ? 'border-danger-500' : 'border-slate-800'} rounded-xl p-4 font-mono text-sm text-primary-300 outline-none focus:ring-1 focus:ring-primary-500 transition-all`}
              value={JSON.stringify(formData.rateLimitConfig, null, 2)}
              onChange={(e) => handleJsonChange('rateLimitConfig', e.target.value)}
            />
            {!isAdmin() && (
                <p className="text-[10px] text-warning-400 mt-2 italic">Note: Scheduling is disabled for personal connectors.</p>
            )}
            {jsonErrors.rateLimitConfig && <p className="text-xs text-danger-400 mt-2">{jsonErrors.rateLimitConfig}</p>}
          </Card>

          <Card className="md:col-span-2" title="Endpoint Harvesting (JSON Array)">
             <p className="text-xs text-slate-500 mb-4">List paths to monitor e.g. {'[{"path": "/latest", "method": "GET"}]'}</p>
             <textarea
              className={`w-full h-48 bg-slate-900 border ${jsonErrors.endpointConfig ? 'border-danger-500' : 'border-slate-800'} rounded-xl p-4 font-mono text-sm text-primary-300 outline-none focus:ring-1 focus:ring-primary-500 transition-all`}
              value={JSON.stringify(formData.endpointConfig, null, 2)}
              onChange={(e) => handleJsonChange('endpointConfig', e.target.value)}
            />
            {jsonErrors.endpointConfig && <p className="text-xs text-danger-400 mt-2">{jsonErrors.endpointConfig}</p>}
          </Card>

          <Card className="md:col-span-2" title="Data Normalization Mappings">
            <p className="text-xs text-slate-500 mb-4">Map source fields to target unified data model.</p>
            <textarea
              className={`w-full h-64 bg-slate-900 border ${jsonErrors.fieldMappingConfig ? 'border-danger-500' : 'border-slate-800'} rounded-xl p-4 font-mono text-sm text-primary-300 outline-none focus:ring-1 focus:ring-primary-500 transition-all`}
              value={JSON.stringify(formData.fieldMappingConfig, null, 2)}
              onChange={(e) => handleJsonChange('fieldMappingConfig', e.target.value)}
            />
            {jsonErrors.fieldMappingConfig && <p className="text-xs text-danger-400 mt-2">{jsonErrors.fieldMappingConfig}</p>}
          </Card>
        </div>

        <div className="flex gap-4 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/connectors')}>
            Discard Changes
          </Button>
          <Button type="submit" showLoading={saving} size="lg">
            {connectorId ? 'Save Configuration' : 'Initialize Connector'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConnectorForm;
