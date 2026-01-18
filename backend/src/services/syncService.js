import axios from 'axios';
import { prisma } from '../utils/prisma.js';
import { delayRequest, retryWithBackoff } from '../utils/rateLimiter.js';

const addLog = async (jobId, level, message) => {
  const job = await prisma.syncJob.findUnique({ where: { id: jobId } });
  const logs = Array.isArray(job.logs) ? job.logs : [];
  logs.push({
    timestamp: new Date().toISOString(),
    level,
    message,
  });
  await prisma.syncJob.update({
    where: { id: jobId },
    data: { logs },
  });
};

const buildAuthHeaders = (connector) => {
  const headers = {};
  const { authType, authConfig } = connector;

  if (authType === 'API_KEY') {
    if (authConfig?.apiKey && authConfig?.headerName) {
      headers[authConfig.headerName] = authConfig.apiKey;
    } else if (authConfig?.apiKey) {
      headers['X-API-Key'] = authConfig.apiKey;
    }
  } else if (authType === 'BEARER') {
    if (authConfig?.bearerToken) {
      headers['Authorization'] = `Bearer ${authConfig.bearerToken}`;
    }
  }

  // Add custom headers if provided
  if (authConfig?.headers && typeof authConfig.headers === 'object') {
    Object.assign(headers, authConfig.headers);
  }

  return headers;
};

const normalizeData = (rawData, fieldMappingConfig) => {
  if (!fieldMappingConfig?.mappings || !Array.isArray(fieldMappingConfig.mappings)) {
    return [];
  }

  const normalized = [];
  const dataArray = Array.isArray(rawData) ? rawData : [rawData];

  for (const item of dataArray) {
    const normalizedItem = {};
    let entityKey = null;

    for (const mapping of fieldMappingConfig.mappings) {
      const { source, target, type, isEntityKey } = mapping;
      
      // Extract value from nested path (e.g., "user.name")
      const value = source.split('.').reduce((obj, key) => obj?.[key], item);

      if (value !== undefined && value !== null) {
        // Type conversion
        let convertedValue = value;
        if (type === 'number') {
          convertedValue = Number(value);
        } else if (type === 'boolean') {
          convertedValue = Boolean(value);
        } else if (type === 'date') {
          convertedValue = new Date(value).toISOString();
        }

        normalizedItem[target] = convertedValue;

        // Mark as entity key if specified
        if (isEntityKey) {
          entityKey = String(convertedValue);
        }
      }
    }

    if (Object.keys(normalizedItem).length > 0) {
      normalized.push({
        data: normalizedItem,
        entityKey: entityKey || `entity_${Date.now()}_${Math.random()}`,
      });
    }
  }

  return normalized;
};

export const triggerSync = async (connectorId, userId) => {
  // Create sync job
  const syncJob = await prisma.syncJob.create({
    data: {
      connectorId,
      userId,
      status: 'PENDING',
      logs: [],
    },
  });

  // Run sync asynchronously
  runSync(syncJob.id, connectorId).catch((error) => {
    console.error('Sync job failed:', error);
  });

  return syncJob;
};

const runSync = async (jobId, connectorId) => {
  try {
    // Update job status to RUNNING
    await prisma.syncJob.update({
      where: { id: jobId },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    await addLog(jobId, 'info', 'Sync job started');

    // Get connector
    const connector = await prisma.connector.findUnique({
      where: { id: connectorId },
    });

    if (!connector) {
      throw new Error('Connector not found');
    }

    await addLog(jobId, 'info', `Fetching data from ${connector.baseUrl}`);

    // Get endpoints from config
    const endpoints = connector.endpointConfig || [];
    if (!Array.isArray(endpoints) || endpoints.length === 0) {
      throw new Error('No endpoints configured');
    }

    // Build auth headers
    const authHeaders = buildAuthHeaders(connector);

    // Fetch data from each endpoint
    for (const endpoint of endpoints) {
      const url = `${connector.baseUrl}${endpoint.path || ''}`;
      const method = endpoint.method || 'GET';

      await addLog(jobId, 'info', `Fetching ${method} ${url}`);

      try {
        // Apply rate limiting delay
        await delayRequest(connectorId, connector.rateLimitConfig);

        // Fetch with retry and backoff
        const response = await retryWithBackoff(async () => {
          return await axios({
            method,
            url,
            headers: {
              'Content-Type': 'application/json',
              ...authHeaders,
            },
            timeout: 30000,
          });
        });

        const responseData = response.data;

        // Store raw API data
        await prisma.rawApiData.create({
          data: {
            syncJobId: jobId,
            endpoint: url,
            response: responseData,
          },
        });

        await addLog(jobId, 'info', `Successfully fetched data from ${url}`);

        // Normalize data if mapping config exists
        if (connector.fieldMappingConfig?.mappings) {
          const normalizedItems = normalizeData(responseData, connector.fieldMappingConfig);

          if (normalizedItems.length > 0) {
            // Store normalized data
            await prisma.normalizedData.createMany({
              data: normalizedItems.map((item) => ({
                syncJobId: jobId,
                connectorId,
                entityKey: item.entityKey,
                data: item.data,
                metadata: {
                  endpoint: url,
                  normalizedAt: new Date().toISOString(),
                },
              })),
            });

            await addLog(
              jobId,
              'info',
              `Normalized and stored ${normalizedItems.length} records`
            );
          }
        }
      } catch (error) {
        const errorMessage = error.response
          ? `HTTP ${error.response.status}: ${error.response.statusText}`
          : error.message;
        await addLog(jobId, 'error', `Failed to fetch ${url}: ${errorMessage}`);
        throw error;
      }
    }

    // Update job status to SUCCESS
    await prisma.syncJob.update({
      where: { id: jobId },
      data: {
        status: 'SUCCESS',
        completedAt: new Date(),
      },
    });

    await addLog(jobId, 'info', 'Sync job completed successfully');
  } catch (error) {
    console.error('Sync error:', error);

    // Update job status to FAILED
    await prisma.syncJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        error: error.message || 'Unknown error',
      },
    });

    await addLog(jobId, 'error', `Sync job failed: ${error.message}`);
  }
};
