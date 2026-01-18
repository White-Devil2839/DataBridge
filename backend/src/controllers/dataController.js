import { prisma } from '../utils/prisma.js';

export const getRawData = async (req, res) => {
  try {
    const { page = 1, limit = 20, syncJobId, endpoint } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Scoping: Raw API data is ADMIN ONLY
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Raw API data is restricted to administrators' });
    }

    const where = {};

    if (syncJobId) {
      where.syncJobId = syncJobId;
    }

    if (endpoint) {
      where.endpoint = {
        contains: endpoint,
      };
    }

    const [data, total] = await Promise.all([
      prisma.rawApiData.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          syncJob: {
            select: {
              id: true,
              status: true,
              createdAt: true,
              connector: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.rawApiData.count({ where }),
    ]);

    res.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get raw data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNormalizedData = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      syncJobId,
      connectorId,
      entityKey,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    // Scoping: Regular users ONLY see their own data (from their own sync jobs)
    if (req.user.role !== 'ADMIN') {
      where.syncJob = {
        userId: req.user.id,
      };
    }

    if (syncJobId) {
      where.syncJobId = syncJobId;
    }

    if (connectorId) {
      where.connectorId = connectorId;
    }

    if (entityKey) {
      where.entityKey = {
        contains: entityKey,
      };
    }

    const [data, total] = await Promise.all([
      prisma.normalizedData.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          syncJob: {
            select: {
              id: true,
              status: true,
              createdAt: true,
            },
          },
          connector: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.normalizedData.count({ where }),
    ]);

    res.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get normalized data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Export normalized data as CSV
 * GET /api/data/normalized/export
 */
export const exportNormalizedData = async (req, res) => {
  try {
    const {
      connectorId,
      syncJobId,
      entityKey,
      from,
      to,
      limit = 10000, // Max rows to export
    } = req.query;

    const where = {};

    // Scoping: Regular users ONLY export their own data
    if (req.user.role !== 'ADMIN') {
      where.syncJob = {
        userId: req.user.id,
      };
    }

    // Apply filters
    if (syncJobId) {
      where.syncJobId = syncJobId;
    }

    if (connectorId) {
      where.connectorId = connectorId;
    }

    if (entityKey) {
      where.entityKey = {
        contains: entityKey,
      };
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    // Fetch data
    const data = await prisma.normalizedData.findMany({
      where,
      take: parseInt(limit),
      include: {
        connector: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (data.length === 0) {
      return res.status(404).json({ error: 'No data to export' });
    }

    // Build CSV
    // Get all unique keys from data objects
    const allKeys = new Set(['id', 'entityKey', 'connectorName', 'createdAt']);
    data.forEach((row) => {
      if (row.data && typeof row.data === 'object') {
        Object.keys(row.data).forEach((key) => allKeys.add(`data_${key}`));
      }
    });

    const headers = Array.from(allKeys);
    const csvRows = [headers.join(',')];

    data.forEach((row) => {
      const values = headers.map((header) => {
        let value;

        if (header === 'id') value = row.id;
        else if (header === 'entityKey') value = row.entityKey;
        else if (header === 'connectorName') value = row.connector?.name || '';
        else if (header === 'createdAt') value = row.createdAt?.toISOString() || '';
        else if (header.startsWith('data_')) {
          const dataKey = header.replace('data_', '');
          value = row.data?.[dataKey];
        }

        // Escape values for CSV
        if (value === null || value === undefined) {
          return '';
        }

        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });

      csvRows.push(values.join(','));
    });

    const csv = csvRows.join('\n');

    // Set headers for file download
    const filename = `normalized_data_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
