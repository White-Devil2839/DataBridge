import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import JSONViewer from '../components/JSONViewer';
import { formatRelativeTime } from '../utils/formatters';
import { cn } from '../utils/helpers';

const Icons = {
  Database: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  Close: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  ChevronLeft: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
};

const RawDataViewer = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({
    endpoint: '',
  });

  useEffect(() => {
    fetchData();
  }, [page, filters.endpoint]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.endpoint && { endpoint: filters.endpoint }),
      });
      const response = await api.get(`/data/raw?${params}`);
      setData(response.data.data);
      setPagination(response.data.pagination);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  if (loading && !data.length) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Raw API Data</h1>
        <p className="text-gray-400 mt-1">Inspect the original JSON responses from your connectors</p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      <Card title="Filters">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-2">Endpoint</label>
            <input
              type="text"
              value={filters.endpoint}
              onChange={(e) => handleFilterChange('endpoint', e.target.value)}
              placeholder="e.g., /quote, /weather..."
              className="w-full px-4 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder-gray-500"
            />
          </div>
          <Button variant="secondary" onClick={fetchData}>
            Apply
          </Button>
        </div>
      </Card>

      <div className={cn("grid gap-6", selectedItem ? "lg:grid-cols-2" : "grid-cols-1")}>
        <Card title="Response List">
          {loading ? (
            <LoadingSpinner />
          ) : data.length === 0 ? (
            <div className="text-center py-12">
              <Icons.Database className="w-12 h-12 mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400">No raw data available</p>
              <p className="text-gray-500 text-sm mt-1">Run a sync job to populate this view</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer transition-all",
                    selectedItem?.id === item.id
                      ? "bg-primary-500/10 border-primary-500/30"
                      : "bg-surface-800/50 border-surface-700/50 hover:border-primary-500/20 hover:bg-surface-700/30"
                  )}
                >
                  <div className="font-medium text-white truncate font-mono text-sm">{item.endpoint}</div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                    <span>{item.syncJob?.connector?.name || 'Unknown'}</span>
                    <span className="text-gray-600">•</span>
                    <span>{formatRelativeTime(item.createdAt)}</span>
                  </div>
                </div>
              ))}
              
              {pagination && (
                <div className="flex items-center justify-between pt-4 border-t border-surface-700/50">
                  <span className="text-xs text-gray-500">
                    {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Icons.ChevronLeft}
                      disabled={pagination.page === 1}
                      onClick={() => setPage(page - 1)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Icons.ChevronRight}
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => setPage(page + 1)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {selectedItem && (
          <Card
            title="Response Preview"
            action={
              <Button variant="ghost" size="sm" icon={Icons.Close} onClick={() => setSelectedItem(null)} />
            }
          >
            <div className="space-y-3 mb-4">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</span>
                <p className="text-sm font-mono text-primary-400 mt-0.5">{selectedItem.endpoint}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fetched</span>
                <p className="text-sm text-white mt-0.5">{new Date(selectedItem.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="rounded-xl bg-surface-900/50 border border-surface-700/50 overflow-hidden max-h-[500px] overflow-y-auto">
              <JSONViewer data={selectedItem.response} />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RawDataViewer;

