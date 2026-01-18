import { useState, useEffect } from 'react';
import api from '../services/api';

export const useSyncJobs = (page = 1, limit = 10, filters = {}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [page, limit, filters.status, filters.connectorId]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.connectorId && { connectorId: filters.connectorId }),
      });
      const response = await api.get(`/jobs?${params}`);
      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  return { jobs, loading, error, pagination, refetch: fetchJobs };
};

export default useSyncJobs;
