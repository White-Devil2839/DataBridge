import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { formatRelativeTime } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';

const DataHealth = () => {
    const [connectors, setConnectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDataHealth = async () => {
        try {
            setLoading(true);
            const response = await api.get('/connectors');
            const connectorsData = response.data.connectors;

            // Enriched health status for each connector based on its sync jobs
            const enrichedConnectors = await Promise.all(connectorsData.map(async (connector) => {
                const jobsResponse = await api.get(`/jobs?connectorId=${connector.id}&limit=1`);
                const lastJob = jobsResponse.data.jobs[0];

                let status = 'Stale';
                if (lastJob) {
                    if (lastJob.status === 'SUCCESS') status = 'OK';
                    else if (lastJob.status === 'FAILED') status = 'Failed';
                    else if (lastJob.status === 'RUNNING') status = 'Syncing';
                }

                return {
                    ...connector,
                    healthStatus: status,
                    lastSync: lastJob ? lastJob.completedAt : null,
                    failureCount: connector._count?.syncJobs || 0 // Simple mock for now
                };
            }));

            setConnectors(enrichedConnectors);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch data health:', err);
            setError('Could not load data health information.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataHealth();
        const interval = setInterval(fetchDataHealth, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading && connectors.length === 0) return <LoadingSpinner />;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">My Data Status</h3>
                <span className="text-xs text-slate-400">Updates every 60s</span>
            </div>

            {error && (
                <div className="p-4 bg-danger-500/10 border border-danger-500/20 rounded-xl text-danger-400 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectors.map(connector => (
                    <Card key={connector.id} className="relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-medium text-white group-hover:text-primary-400 transition-colors">
                                    {connector.name}
                                </h4>
                                <p className="text-xs text-slate-400 truncate max-w-[150px]">
                                    {connector.baseUrl}
                                </p>
                            </div>
                            <StatusBadge 
                                status={connector.healthStatus === 'OK' ? 'SUCCESS' : connector.healthStatus === 'Syncing' ? 'RUNNING' : 'FAILED'} 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-slate-500">Last Successful Sync</div>
                            <div className="text-slate-300 text-right">
                                {connector.lastSync ? formatRelativeTime(connector.lastSync) : 'Never'}
                            </div>
                            
                            <div className="text-slate-500">Status</div>
                            <div className={`text-right font-medium ${
                                connector.healthStatus === 'OK' ? 'text-success-400' : 
                                connector.healthStatus === 'Failed' ? 'text-danger-400' : 'text-warning-400'
                            }`}>
                                {connector.healthStatus}
                            </div>
                        </div>

                        {connector.isShared && (
                            <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                                <span className="bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                    Shared
                                </span>
                            </div>
                        )}
                    </Card>
                ))}
                
                {connectors.length === 0 && !loading && (
                    <div className="col-span-full py-10 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
                        No connectors found to track.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataHealth;
