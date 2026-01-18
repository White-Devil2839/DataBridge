import { useState, useEffect } from 'react';
import api from '../services/api';

export const useConnectors = (page = 1, limit = 10) => {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchConnectors();
  }, [page, limit]);

  const fetchConnectors = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/connectors?page=${page}&limit=${limit}`);
      setConnectors(response.data.connectors);
      setPagination(response.data.pagination);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch connectors');
    } finally {
      setLoading(false);
    }
  };

  return { connectors, loading, error, pagination, refetch: fetchConnectors };
};

export default useConnectors;
