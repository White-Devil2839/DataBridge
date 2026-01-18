import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import { Select } from '../components/Input';
import { formatRelativeTime } from '../utils/formatters';

const Icons = {
  Download: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Filter: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
};

const NormalizedDataView = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  const [connectors, setConnectors] = useState([]);
  const [filters, setFilters] = useState({
    connectorId: '',
    entityKey: '',
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchConnectors();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, filters.connectorId, filters.entityKey]);

  useEffect(() => {
    if (data.length > 0) {
      const chartDataMap = {};
      data.forEach((item) => {
        const date = new Date(item.createdAt).toLocaleDateString();
        if (!chartDataMap[date]) {
          chartDataMap[date] = { date, count: 0 };
        }
        chartDataMap[date].count++;
      });
      setChartData(Object.values(chartDataMap).sort((a, b) => new Date(a.date) - new Date(b.date)));
    }
  }, [data]);

  const fetchConnectors = async () => {
    try {
      const response = await api.get('/connectors?limit=100');
      setConnectors(response.data.connectors || []);
    } catch (err) {
      // Silently fail, connectors are optional for filtering
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.connectorId && { connectorId: filters.connectorId }),
        ...(filters.entityKey && { entityKey: filters.entityKey }),
      });
      const response = await api.get(`/data/normalized?${params}`);
      setData(response.data.data);
      setPagination(response.data.pagination);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...(filters.connectorId && { connectorId: filters.connectorId }),
        ...(filters.entityKey && { entityKey: filters.entityKey }),
      });
      const response = await api.get(`/data/normalized/export?${params}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `normalized_data_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export data');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const columns = [
    {
      header: 'Entity Key',
      accessor: (row) => (
        <span className="text-primary-400 font-medium">{row.entityKey}</span>
      ),
    },
    {
      header: 'Connector',
      accessor: (row) => (
        <span className="text-gray-300">{row.connector?.name || 'N/A'}</span>
      ),
    },
    {
      header: 'Data Preview',
      accessor: (row) => {
        const preview = JSON.stringify(row.data).slice(0, 60);
        return (
          <span className="text-gray-400 font-mono text-xs">
            {preview}{preview.length >= 60 ? '...' : ''}
          </span>
        );
      },
    },
    {
      header: 'Created',
      accessor: (row) => (
        <span className="text-gray-400 text-sm">{formatRelativeTime(row.createdAt)}</span>
      ),
    },
  ];

  if (loading && !data.length) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Normalized Data</h1>
          <p className="text-gray-400 mt-1">Browse and export your processed data records</p>
        </div>
        
        <Button variant="primary" icon={Icons.Download} onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      <Card title="Filters" subtitle="Narrow down your data" icon={Icons.Filter}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Connector"
            value={filters.connectorId}
            onChange={(e) => handleFilterChange('connectorId', e.target.value)}
          >
            <option value="">All Connectors</option>
            {connectors.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Entity Key</label>
            <input
              type="text"
              value={filters.entityKey}
              onChange={(e) => handleFilterChange('entityKey', e.target.value)}
              placeholder="e.g., stock_quote, weather_report..."
              className="w-full px-4 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder-gray-500"
            />
          </div>
        </div>
      </Card>

      {chartData.length > 0 && (
        <Card title="Records Over Time" subtitle="Last synced data">
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
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
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  name="Records"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        emptyMessage="No normalized data found. Try adjusting filters or run a sync."
      />
    </div>
  );
};

export default NormalizedDataView;
